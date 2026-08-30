(function () {

  window.WebCloneResourceManager = {

    normalizeURL(url, baseURL) {
      try {
        return new URL(url, baseURL).href;
      } catch {
        return null;
      }
    },

    isSafeStaticResource(resource) {

      if (!resource || !resource.url) {
        return false;
      }

      const type = resource.type;

      return [
        "css",
        "js",
        "image",
        "video",
        "audio",
        "asset",
        "css-asset",
        "font"
      ].includes(type);
    },

    deduplicate(resources) {

      const seen = new Set();
      const result = [];

      for (const resource of resources) {

        if (!resource.url) {
          continue;
        }

        if (seen.has(resource.url)) {
          continue;
        }

        seen.add(resource.url);
        result.push(resource);
      }

      return result;
    },

    classifyContentType(contentType) {

      if (!contentType) {
        return "asset";
      }

      const value =
        contentType.toLowerCase();

      if (value.includes("text/css")) {
        return "css";
      }

      if (
        value.includes("javascript") ||
        value.includes("ecmascript")
      ) {
        return "js";
      }

      if (value.startsWith("image/")) {
        return "image";
      }

      if (value.startsWith("video/")) {
        return "video";
      }

      if (value.startsWith("audio/")) {
        return "audio";
      }

      if (
        value.includes("font") ||
        value.includes("woff") ||
        value.includes("ttf")
      ) {
        return "font";
      }

      return "asset";
    }

  };

})();
