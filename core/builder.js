(function () {

  window.WebCloneBuilder = {

    sanitizeFilename(name) {

      return String(name || "")
        .replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          "_"
        )
        .replace(
          /\s+/g,
          "_"
        )
        .slice(0, 160);

    },


    extensionFromURL(
      url,
      fallback = "bin"
    ) {

      try {

        const pathname =
          new URL(url).pathname;

        const match =
          pathname.match(
            /\.([a-zA-Z0-9]{1,10})$/
          );

        if (match) {
          return match[1].toLowerCase();
        }

      } catch {}

      return fallback;
    },


    folderForType(type) {

      switch (type) {

        case "css":
        case "css-import":
        case "inline-css":
          return "css";

        case "js":
        case "js-module":
        case "inline-js":
          return "js";

        case "image":
        case "css-asset":
        case "js-asset":
          return "images";

        case "font":
          return "fonts";

        case "video":
        case "audio":
          return "media";

        default:
          return "assets";
      }

    },


    createResourcePath(
      resource,
      index
    ) {

      const folder =
        this.folderForType(
          resource.type
        );


      let extension =
        this.extensionFromURL(
          resource.url,
          "bin"
        );


      if (
        resource.type === "css" ||
        resource.type === "css-import"
      ) {
        extension = "css";
      }


      if (
        resource.type === "js" ||
        resource.type === "js-module"
      ) {
        extension = "js";
      }


      let filename =
        `resource_${
          String(index + 1)
            .padStart(4, "0")
        }`;


      try {

        const url =
          new URL(
            resource.url
          );


        let pathname =
          url.pathname;


        const parts =
          pathname
            .split("/")
            .filter(Boolean);


        const original =
          parts.pop();


        if (original) {

          filename =
            this.sanitizeFilename(
              original
            );


          if (
            !filename.includes(".")
          ) {

            filename +=
              "." + extension;

          }

        }

      } catch {}


      return `${folder}/${filename}`;

    },


    createMapping(resources) {

      const mapping = {};

      const usedPaths =
        new Set();


      resources.forEach(
        (resource, index) => {

          if (!resource.url) {
            return;
          }


          if (
            mapping[resource.url]
          ) {
            return;
          }


          let path =
            this.createResourcePath(
              resource,
              index
            );


          /*
           * Prevent filename collisions.
           */

          if (
            usedPaths.has(path)
          ) {

            const dot =
              path.lastIndexOf(".");

            const extension =
              dot >= 0
                ? path.slice(dot)
                : "";

            const base =
              dot >= 0
                ? path.slice(0, dot)
                : path;


            let counter = 2;

            while (
              usedPaths.has(
                `${base}-${counter}${extension}`
              )
            ) {

              counter++;

            }


            path =
              `${base}-${counter}${extension}`;

          }


          usedPaths.add(path);

          mapping[
            resource.url
          ] = path;

        }
      );


      return mapping;

    }

  };

})();
