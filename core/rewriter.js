(function () {

  window.WebCloneRewriter = {

    rewriteHTML(
      html,
      mapping
    ) {

      if (!html) {
        return html;
      }


      let result =
        html;


      const entries =
        Object.entries(mapping)
          .filter(
            ([remote, local]) =>
              remote && local
          )
          .sort(
            (a, b) =>
              b[0].length -
              a[0].length
          );


      for (
        const [
          remote,
          local
        ] of entries
      ) {

        result =
          result.split(
            remote
          ).join(
            local
          );

      }


      return result;

    },


    rewriteJS(
      js,
      mapping
    ) {

      if (!js) {
        return js;
      }

      let result = js;

      const entries =
        Object.entries(mapping)
          .filter(
            ([remote, local]) =>
              remote && local
          )
          .sort(
            (a, b) =>
              b[0].length -
              a[0].length
          );

      for (
        const [
          remote,
          local
        ] of entries
      ) {

        result =
          result.split(
            remote
          ).join(
            local
          );

      }

      return result;
    },


    rewriteCSS(
      css,
      mapping
    ) {

      if (!css) {
        return css;
      }


      let result =
        css;


      /*
       * url(...)
       */

      result =
        result.replace(
          /url\(\s*(['"]?)(.*?)\1\s*\)/gi,
          (
            full,
            quote,
            value
          ) => {

            const clean =
              value.trim();


            if (
              mapping[clean]
            ) {

              return `url("${mapping[clean]}")`;

            }


            /*
             * Try absolute URL
             * when CSS used a relative URL.
             */

            return full;

          }
        );


      /*
       * @import "..."
       */

      result =
        result.replace(
          /(@import\s+)(["'])(.*?)\2/gi,
          (
            full,
            prefix,
            quote,
            value
          ) => {

            if (
              mapping[value]
            ) {

              return (
                prefix +
                quote +
                mapping[value] +
                quote
              );

            }

            return full;

          }
        );


      /*
       * Fallback direct replacement.
       */

      const entries =
        Object.entries(mapping)
          .filter(
            ([remote, local]) =>
              remote && local
          )
          .sort(
            (a, b) =>
              b[0].length -
              a[0].length
          );


      for (
        const [
          remote,
          local
        ] of entries
      ) {

        result =
          result.split(
            remote
          ).join(
            local
          );

      }


      return result;

    }

  };

})();
