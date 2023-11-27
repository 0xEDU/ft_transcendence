const Counter = artifacts.require("Counter");

module.exports = function(_deployer) {
  _deployer.deploy(Counter)
};
