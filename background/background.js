chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    /*
     * ==========================================
     * Capture current page
     * ==========================================
     */

    if (
      message?.type === "CLONE_CURRENT_PAGE"
    ) {

      (async () => {

        try {

          const tabs =
            await chrome.tabs.query({
              active: true,
              currentWindow: true
            });


          const tab =
            tabs[0];


          if (
            !tab ||
            !tab.id
          ) {

            throw new Error(
              "No active tab."
            );

          }


          /*
           * Chrome internal pages cannot
           * be scripted.
           */

          if (
            !tab.url ||
            !/^https?:\/\//i.test(tab.url)
          ) {

            throw new Error(
              "This page cannot be cloned. Open a normal HTTP/HTTPS webpage."
            );

          }


          /*
           * Execute content/content.js
           *
           * The IIFE in content.js returns
           * the capture object.
           */

          const results =
            await chrome.scripting.executeScript({

              target: {
                tabId: tab.id
              },

              files: [
                "content/content.js"
              ]

            });


          const capture =
            results?.[0]?.result;


          if (
            !capture ||
            !capture.html
          ) {

            throw new Error(
              "Content capture returned no HTML."
            );

          }


          sendResponse({
            success: true,
            capture
          });


        } catch (error) {

          console.error(
            "Web Clone capture failed:",
            error
          );


          sendResponse({
            success: false,
            error:
              error?.message ||
              "Capture failed."
          });

        }

      })();


      return true;
    }


    /*
     * ==========================================
     * Resource fetching
     * ==========================================
     *
     * Keep the existing downloader pipeline.
     */

    if (
      message?.type === "WEB_CLONE_FETCH"
    ) {

      (async () => {

        try {

          const response =
            await fetch(
              message.url,
              {
                credentials: "include"
              }
            );


          if (!response.ok) {

            throw new Error(
              `HTTP ${response.status}`
            );

          }


          const buffer =
            await response.arrayBuffer();


          const bytes =
            Array.from(
              new Uint8Array(
                buffer
              )
            );


          sendResponse({

            success: true,

            url:
              message.url,

            contentType:
              response.headers.get(
                "content-type"
              ) || "",

            bytes

          });


        } catch (error) {

          sendResponse({

            success: false,

            url:
              message.url,

            error:
              error?.message ||
              "Fetch failed"

          });

        }

      })();


      return true;
    }

  }
);
