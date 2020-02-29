module.exports = function(common, mode) {
  const id = (mode === "production") ?
    (
      "gecko-extension@tabsleeper.com"
    ) : (
      "gecko-extension-development@tabsleeper.com"
    );

  return {
    ...common,
    applications: {
      gecko: {
        id,
        strict_min_version: "53.0"
      }
    },
  };
}
