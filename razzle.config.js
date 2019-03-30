module.exports = {
  modify: (config) => {
    delete config.externals;

    return config;
  },
};