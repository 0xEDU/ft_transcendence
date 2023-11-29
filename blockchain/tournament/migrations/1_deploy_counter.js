const Tournaments = artifacts.require("Tournaments");

module.exports = function(_deployer) {
  _deployer.deploy(Tournaments)
};
