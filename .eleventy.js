module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/pdf");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    pathPrefix: "/",
  };
};
