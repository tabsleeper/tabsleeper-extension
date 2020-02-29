module.exports = function(common, mode) {
  return {
    ...common,
    permissions: [
      ...common.permissions,
      "chrome://favicon",
    ],
  };
}
