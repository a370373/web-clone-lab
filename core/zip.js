(function () {
  window.WebCloneZip = {

    async create(files) {

      if (!window.JSZip) {
        throw new Error("JSZip is not available.");
      }

      const zip = new JSZip();

      for (const file of files) {

        if (!file || !file.path) {
          continue;
        }

        if (file.binary) {

          zip.file(
            file.path,
            file.data,
            {
              binary: true
            }
          );

        } else {

          zip.file(
            file.path,
            file.data || ""
          );

        }
      }

      return zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });
    }

  };
})();
