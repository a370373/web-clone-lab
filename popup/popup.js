const button =
  document.getElementById("cloneButton");

const status =
  document.getElementById("status");

const pageInfo =
  document.getElementById("pageInfo");

const htmlStatus =
  document.getElementById("htmlStatus");

const cssStatus =
  document.getElementById("cssStatus");

const jsStatus =
  document.getElementById("jsStatus");

const assetStatus =
  document.getElementById("assetStatus");


async function getCurrentTab() {

  const tabs =
    await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

  return tabs[0];
}


function setStatus(message) {
  status.textContent = message;
}


function countTypes(resources) {

  return {

    css:
      resources.filter(r =>
        r.type === "css" ||
        r.type === "inline-css"
      ).length,

    js:
      resources.filter(r =>
        r.type === "js" ||
        r.type === "inline-js"
      ).length,

    assets:
      resources.filter(r =>
        ![
          "css",
          "inline-css",
          "js",
          "inline-js"
        ].includes(r.type)
      ).length

  };

}


async function capturePage(tabId) {

  const results =
    await chrome.scripting.executeScript({

      target: {
        tabId
      },

      func: () => {

        const absolute = value => {

          try {
            return new URL(
              value,
              location.href
            ).href;

          } catch {
            return null;
          }

        };

        const resources = [];

        const add = (
          type,
          url,
          extra = {}
        ) => {

          const absoluteUrl =
            absolute(url);

          if (!absoluteUrl) {
            return;
          }

          resources.push({
            type,
            url: absoluteUrl,
            ...extra
          });

        };


        document
          .querySelectorAll(
            'link[rel="stylesheet"]'
          )
          .forEach(el => {
            add("css", el.href);
          });


        document
          .querySelectorAll(
            "script[src]"
          )
          .forEach(el => {

            add(
              "js",
              el.src,
              {
                module:
                  el.type === "module"
              }
            );

          });


        document
          .querySelectorAll("img")
          .forEach(el => {

            add(
              "image",
              el.currentSrc || el.src,
              {
                alt:
                  el.alt || ""
              }
            );

          });


        document
          .querySelectorAll(
            "source[src]"
          )
          .forEach(el => {

            add(
              "asset",
              el.src
            );

          });


        document
          .querySelectorAll("video")
          .forEach(el => {

            if (el.currentSrc) {
              add(
                "video",
                el.currentSrc
              );
            }

            if (el.src) {
              add(
                "video",
                el.src
              );
            }

          });


        document
          .querySelectorAll("audio")
          .forEach(el => {

            if (el.currentSrc) {
              add(
                "audio",
                el.currentSrc
              );
            }

            if (el.src) {
              add(
                "audio",
                el.src
              );
            }

          });


        document
          .querySelectorAll(
            "link[href]"
          )
          .forEach(el => {

            const rel =
              (el.rel || "")
                .toLowerCase();

            if (
              rel.includes("icon") ||
              rel.includes("manifest") ||
              rel.includes("preload") ||
              rel.includes("apple-touch")
            ) {

              add(
                "asset",
                el.href,
                { rel }
              );

            }

          });


        document
          .querySelectorAll("style")
          .forEach((el, index) => {

            resources.push({

              type: "inline-css",
              url: null,
              index,
              content:
                el.textContent || ""

            });

          });


        document
          .querySelectorAll(
            "script:not([src])"
          )
          .forEach((el, index) => {

            resources.push({

              type: "inline-js",
              url: null,
              index,
              content:
                el.textContent || ""

            });

          });


        return {

          version: "0.6.0",

          capturedAt:
            new Date().toISOString(),

          page: {

            url: location.href,

            origin:
              location.origin,

            title:
              document.title

          },

          html:
            document.documentElement
              .outerHTML,

          resources

        };

      }

    });


  if (
    !results ||
    !results[0] ||
    !results[0].result
  ) {

    throw new Error(
      "Capture returned nothing."
    );

  }


  return results[0].result;
}


async function buildProject(
  capture
) {

  const files = [];

  const report = {
    totalResources: 0,
    downloadedResources: 0,
    failedResources: 0,
    skippedResources: 0,
    types: {},
    failures: []
  };

  let resources =
    WebCloneResourceManager.deduplicate(
      capture.resources
    );

  const mapping =
    WebCloneBuilder.createMapping(
      resources
    );


  // -------------------------
  // HTML
  // -------------------------

  const rewrittenHTML =
    WebCloneRewriter.rewriteHTML(
      capture.html,
      mapping
    );

  files.push({
    path: "index.html",
    data: rewrittenHTML
  });


  // -------------------------
  // Inline CSS
  // -------------------------

  capture.resources
    .filter(
      r => r.type === "inline-css"
    )
    .forEach((resource, index) => {

      files.push({

        path:
          `css/inline-${index + 1}.css`,

        data:
          WebCloneRewriter.rewriteCSS(
            resource.content,
            mapping
          )

      });

    });


  // -------------------------
  // Inline JS
  // -------------------------

  capture.resources
    .filter(
      r => r.type === "inline-js"
    )
    .forEach((resource, index) => {

      files.push({

        path:
          `js/inline-${index + 1}.js`,

        data:
          resource.content

      });

    });


  // -------------------------
  // Resource Queue
  // -------------------------

  const queue = [
    ...resources
  ];


  const processed =
    new Set();


  while (queue.length > 0) {

    const resource =
      queue.shift();


    if (!resource.url) {
      report.skippedResources++;
      continue;
    }

    report.types[resource.type] =
      (report.types[resource.type] || 0) + 1;


    if (
      processed.has(
        resource.url
      )
    ) {
      continue;
    }


    processed.add(
      resource.url
    );


    if (
      !WebCloneResourceManager
        .isSafeStaticResource(resource)
    ) {
      continue;
    }


    let localPath =
      mapping[resource.url];


    if (!localPath) {

      const index =
        resources.length;

      localPath =
        WebCloneBuilder
          .createResourcePath(
            resource,
            index
          );

      mapping[resource.url] =
        localPath;

    }


    setStatus(
      "⬇️ " +
      resource.url
    );


    const result =
      await WebCloneDownloader
        .download(
          resource.url
        );


    if (!result.success) {

      report.failedResources++;

      report.failures.push({
        url: resource.url,
        type: resource.type,
        error: result.error || "Unknown error"
      });

      console.warn(
        "Resource failed:",
        resource.url,
        result.error
      );

      continue;
    }

    report.downloadedResources++;


    const contentType =
      result.contentType || "";


    // -------------------------
    // CSS
    // -------------------------

    const isCSS =
      resource.type === "css" ||
      resource.type === "css-import" ||
      contentType.includes(
        "text/css"
      );


    if (isCSS) {

      const decoder =
        new TextDecoder("utf-8");

      const css =
        decoder.decode(
          new Uint8Array(
            result.bytes
          )
        );


      const discovered =
        WebCloneCSSScanner.scan(
          css,
          resource.url
        );


      for (
        const child
        of discovered
      ) {

        if (!mapping[child.url]) {

          resources.push(
            child
          );

          mapping[child.url] =
            WebCloneBuilder
              .createResourcePath(
                child,
                resources.length - 1
              );

          queue.push(
            child
          );

        }

      }


      const rewrittenCSS =
        WebCloneRewriter.rewriteCSS(
          css,
          mapping
        );


      files.push({

        path: localPath,

        data: rewrittenCSS

      });


      continue;
    }


    // -------------------------
    // JavaScript
    // -------------------------

    const isJS =
      resource.type === "js" ||
      resource.type === "js-module" ||
      contentType.includes(
        "javascript"
      ) ||
      contentType.includes(
        "ecmascript"
      );


    if (isJS) {

      const decoder =
        new TextDecoder("utf-8");

      const js =
        decoder.decode(
          new Uint8Array(
            result.bytes
          )
        );


      const jsScan =
        WebCloneJSScanner.scan(
          js,
          resource.url
        );

      const discovered =
        jsScan.resources || [];

      if (jsScan.externalDependencies) {

        for (
          const dependency
          of jsScan.externalDependencies
        ) {

          console.info(
            "External dependency:",
            dependency
          );

        }

      }


      for (
        const child
        of discovered
      ) {

        if (!mapping[child.url]) {

          resources.push(
            child
          );

          mapping[child.url] =
            WebCloneBuilder
              .createResourcePath(
                child,
                resources.length - 1
              );

          queue.push(
            child
          );

        }

      }


      /*
       * Rewrite only known local
       * static resources.
       */

      const rewrittenJS =
        WebCloneRewriter.rewriteJS(
          js,
          mapping
        );


      files.push({

        path: localPath,

        data: rewrittenJS

      });


      continue;
    }


    // -------------------------
    // Binary / other static files
    // -------------------------

    files.push({

      path: localPath,

      data:
        new Uint8Array(
          result.bytes
        ),

      binary: true

    });

  }


  report.totalResources =
    resources.length;

  // -------------------------
  // Manifest
  // -------------------------

  files.push({

    path:
      "clone-manifest.json",

    data:
      JSON.stringify({

        version:
          capture.version,

        capturedAt:
          capture.capturedAt,

        source:
          capture.page,

        report,

        resources:
          resources.map(
            resource => ({

              ...resource,

              localPath:
                mapping[
                  resource.url
                ] || null

            })
          )

      }, null, 2)

  });


  return {
    files,
    mapping,
    report
  };
}

async function cloneCurrentPage() {

  try {

    setStatus("🔎 Capturing page...");


    /*
     * Ask background/content layer
     * for the current page snapshot.
     */

    const capture =
      await new Promise(
        (resolve, reject) => {

          chrome.runtime.sendMessage(
            {
              type: "CLONE_CURRENT_PAGE"
            },
            response => {

              if (
                chrome.runtime.lastError
              ) {

                reject(
                  new Error(
                    chrome.runtime.lastError.message
                  )
                );

                return;
              }


              if (
                !response
              ) {

                reject(
                  new Error(
                    "No response from background"
                  )
                );

                return;
              }


              if (
                !response.success
              ) {

                reject(
                  new Error(
                    response.error ||
                    "Capture failed"
                  )
                );

                return;
              }


              resolve(
                response.capture
              );

            }
          );

        }
      );


    if (
      !capture ||
      !capture.html
    ) {

      throw new Error(
        "Captured page contains no HTML"
      );

    }


    setStatus(
      "🧬 Building resource graph..."
    );


    const project =
      await buildProject(
        capture
      );


    if (
      !project ||
      !project.files ||
      !project.files.length
    ) {

      throw new Error(
        "Build produced no files"
      );

    }


    setStatus(
      "📦 Creating ZIP..."
    );


    const hostname =
      (() => {

        try {

          return new URL(
            capture.page?.url ||
            capture.url
          ).hostname
            .replace(
              /[^a-zA-Z0-9.-]/g,
              "_"
            );

        } catch {

          return "website";

        }

      })();


    const timestamp =
      new Date()
        .toISOString()
        .replace(
          /[:.]/g,
          "-"
        );


    const filename =
      `web-clone-${hostname}-${timestamp}.zip`;


    const zipBlob =
      await WebCloneZip.create(
        project.files
      );

    const zipURL =
      URL.createObjectURL(
        zipBlob
      );

    await chrome.downloads.download({
      url: zipURL,
      filename,
      saveAs: true
    });

    setTimeout(
      () => URL.revokeObjectURL(zipURL),
      10000
    );


    setStatus(
      "🎉 Clone complete!"
    );


    /*
     * Show basic result.
     */

    if (
      project.report
    ) {

      console.info(
        "Clone report:",
        project.report
      );

    }


    return project;


  } catch (error) {

    console.error(
      "Web Clone failed:",
      error
    );


    setStatus(
      "❌ Clone failed: " +
      (
        error.message ||
        String(error)
      )
    );


    throw error;

  }

}

/*
 * Clone button bootstrap
 */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const button =
      document.querySelector(
        "#cloneButton, #clone, [data-action='clone']"
      );


    if (!button) {

      console.warn(
        "Web Clone Lab: Clone button not found"
      );

      return;
    }


    button.addEventListener(
      "click",
      async () => {

        button.disabled = true;

        const original =
          button.textContent;

        button.textContent =
          "🧬 Cloning...";


        try {

          await cloneCurrentPage();

        } catch (error) {

          console.error(error);

        } finally {

          button.disabled = false;

          button.textContent =
            original;

        }

      }
    );

  }
);
