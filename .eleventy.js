module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images"); // ajouter le doss img
  eleventyConfig.addPassthroughCopy("src/pdf"); // idem pdf

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    pathPrefix: "/",
  };
};
