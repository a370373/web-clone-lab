(() => {
  const absolute = (value) => {
    try {
      return new URL(value, location.href).href;
    } catch {
      return null;
    }
  };

  const resources = [];

  const add = (type, url, extra = {}) => {
    const absoluteUrl = absolute(url);

    if (!absoluteUrl) return;

    resources.push({
      type,
      url: absoluteUrl,
      ...extra
    });
  };

  // CSS
  document
    .querySelectorAll('link[rel="stylesheet"]')
    .forEach(el => {
      add("css", el.href);
    });

  // JS
  document
    .querySelectorAll("script[src]")
    .forEach(el => {
      add("js", el.src, {
        module: el.type === "module"
      });
    });

  // Images
  document
    .querySelectorAll("img")
    .forEach(el => {
      add(
        "image",
        el.currentSrc || el.src,
        {
          alt: el.alt || ""
        }
      );
    });

  // Source
  document
    .querySelectorAll("source[src]")
    .forEach(el => {
      add("asset", el.src);
    });

  // Video
  document
    .querySelectorAll("video")
    .forEach(el => {
      if (el.currentSrc) {
        add("video", el.currentSrc);
      }

      if (el.src) {
        add("video", el.src);
      }
    });

  // Audio
  document
    .querySelectorAll("audio")
    .forEach(el => {
      if (el.currentSrc) {
        add("audio", el.currentSrc);
      }

      if (el.src) {
        add("audio", el.src);
      }
    });

  // Icons / manifest / preload
  document
    .querySelectorAll("link[href]")
    .forEach(el => {

      const rel =
        (el.rel || "").toLowerCase();

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

  // Inline CSS
  document
    .querySelectorAll("style")
    .forEach((el, index) => {

      resources.push({
        type: "inline-css",
        url: null,
        index,
        content: el.textContent || ""
      });

    });

  // Inline JS
  document
    .querySelectorAll("script:not([src])")
    .forEach((el, index) => {

      resources.push({
        type: "inline-js",
        url: null,
        index,
        content: el.textContent || ""
      });

    });

  // Inline style url(...)
  document
    .querySelectorAll("[style]")
    .forEach(el => {

      const style =
        el.getAttribute("style") || "";

      const matches =
        style.matchAll(
          /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi
        );

      for (const match of matches) {
        add(
          "css-asset",
          match[1]
        );
      }

    });

  // Create a sanitized snapshot.
// Do not export user-entered form values or password fields.
const snapshotDocument =
  document.documentElement.cloneNode(true);

snapshotDocument
  .querySelectorAll(
    'input[type="password"], input[type="email"], input[type="text"], textarea'
  )
  .forEach(el => {
    el.removeAttribute("value");
    el.textContent = "";
  });

snapshotDocument
  .querySelectorAll("form")
  .forEach(form => {
    form.setAttribute(
      "data-web-clone-lab-form",
      "disabled-in-snapshot"
    );
  });

const capture = {
    version: "0.6.0",

    capturedAt:
      new Date().toISOString(),

    page: {
      url: location.href,
      origin: location.origin,
      title: document.title
    },

    html:
      snapshotDocument.outerHTML,

    resources
  };

  console.log(
    "🧬 Web Clone Lab Capture:",
    capture
  );

  return capture;
})();
