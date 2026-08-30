(function () {

  window.WebCloneJSScanner = {

    scan(js, baseURL) {

      const results = [];

      if (!js || !baseURL) {
        /*
       * Detect API-like calls.
       * These are recorded conceptually but are
       * NOT treated as downloadable static assets.
       */

      const apiRegex =
        /(?:fetch|axios\.(?:get|post|put|delete|patch)|XMLHttpRequest)[^;]{0,300}/gi;

      while (
        (match = apiRegex.exec(js)) !== null
      ) {

        externalDependencies.push({
          type: "api",
          snippet:
            match[0].slice(0, 300)
        });

      }

      return {
        resources: results,
        externalDependencies
      };
      }

      const seen = new Set();

      const externalDependencies = [];

      const add = (raw, type = "js-asset") => {

        if (!raw) {
          return;
        }

        raw = raw.trim();

        if (
          raw.startsWith("data:") ||
          raw.startsWith("blob:") ||
          raw.startsWith("#")
        ) {
          return;
        }

        try {

          const url =
            new URL(raw, baseURL).href;

          if (
            url.startsWith("http://") ||
            url.startsWith("https://")
          ) {

            if (!seen.has(url)) {

              seen.add(url);

              results.push({
                type,
                url
              });

            }

          }

        } catch {}

      };


      /*
       * ES module imports
       *
       * import "./chunk.js"
       * import("./chunk.js")
       */

      const importRegex =
        /(?:import\s*\(\s*|import\s+)(["'])(.*?)\1/gi;

      let match;

      while (
        (match =
          importRegex.exec(js)) !== null
      ) {

        add(
          match[2],
          "js-module"
        );

      }


      /*
       * new URL(...)
       *
       * new URL("./image.webp", import.meta.url)
       */

      const newURLRegex =
        /new\s+URL\s*\(\s*(["'])(.*?)\1\s*,\s*import\.meta\.url\s*\)/gi;

      while (
        (match =
          newURLRegex.exec(js)) !== null
      ) {

        add(
          match[2],
          "js-asset"
        );

      }


      /*
       * Static string assets.
       *
       * Only recognise obvious static
       * file extensions.
       */

      const assetRegex =
        /["']([^"'\\]+\.(?:png|jpe?g|gif|svg|webp|avif|ico|bmp|css|woff2?|ttf|otf|eot|mp3|wav|ogg|mp4|webm|wasm))["']/gi;

      while (
        (match =
          assetRegex.exec(js)) !== null
      ) {

        add(
          match[1],
          "js-asset"
        );

      }


      return results;
    }

  };

})();
