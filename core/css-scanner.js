(function () {

  window.WebCloneCSSScanner = {

    scan(css, baseURL) {

      const results = [];

      if (!css) {
        return results;
      }

      // url(...)
      const urlRegex =
        /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

      let match;

      while (
        (match = urlRegex.exec(css)) !== null
      ) {

        const raw = match[2].trim();

        if (!raw) {
          continue;
        }

        if (
          raw.startsWith("data:") ||
          raw.startsWith("blob:")
        ) {
          continue;
        }

        try {

          const url =
            new URL(
              raw,
              baseURL
            ).href;

          results.push({
            type: "css-asset",
            url
          });

        } catch {}

      }


      // @import
      const importRegex =
        /@import\s+(?:url\(\s*)?(['"])(.*?)\1\s*\)?/gi;

      while (
        (match =
          importRegex.exec(css)) !== null
      ) {

        const raw =
          match[2].trim();

        if (!raw) {
          continue;
        }

        try {

          const url =
            new URL(
              raw,
              baseURL
            ).href;

          results.push({
            type: "css-import",
            url
          });

        } catch {}

      }


      // 去重
      const seen =
        new Set();

      return results.filter(
        resource => {

          if (
            seen.has(resource.url)
          ) {
            return false;
          }

          seen.add(
            resource.url
          );

          return true;

        }
      );

    }

  };

})();
