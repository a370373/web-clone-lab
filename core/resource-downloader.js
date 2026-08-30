(function () {

  window.WebCloneDownloader = {

    async download(url) {

      return new Promise((resolve) => {

        chrome.runtime.sendMessage(
          {
            type:
              "WEB_CLONE_FETCH",

            url
          },

          response => {

            if (
              chrome.runtime.lastError
            ) {

              resolve({
                success: false,
                url,
                error:
                  chrome.runtime
                    .lastError
                    .message
              });

              return;
            }

            if (!response) {

              resolve({
                success: false,
                url,
                error:
                  "No response"
              });

              return;
            }

            resolve(response);
          }
        );

      });

    }

  };

})();
