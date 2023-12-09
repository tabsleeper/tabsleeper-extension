module.exports = function (common, mode) {
  const id =
    mode === "production"
      ? "gecko-extension@tabsleeper.com"
      : "gecko-extension-development@tabsleeper.com";

  return {
    ...common,
    background: {
      scripts: [common.background.service_worker],
    },
    browser_specific_settings: {
      gecko: {
        id,
        strict_min_version: "66.0",
      },
    },
  };
};
