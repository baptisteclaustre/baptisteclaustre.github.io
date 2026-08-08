module.exports = function (eleventyConfig) {
  // Copie le CSS et les images tel quel dans le site final
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    // Si ton site est publié sur https://TON-PSEUDO.github.io/NOM-DU-DEPOT/
    // (dépôt "projet", pas dépôt "TON-PSEUDO.github.io"), décommente la ligne
    // ci-dessous et remplace NOM-DU-DEPOT par le nom exact de ton dépôt GitHub.
    // pathPrefix: "/NOM-DU-DEPOT/",
  };
};
