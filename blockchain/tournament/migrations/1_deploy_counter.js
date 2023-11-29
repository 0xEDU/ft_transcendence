const Counter = artifacts.require("Tournaments");

module.exports = function(_deployer) {
  _deployer.deploy(Counter)
  .then(() => console.log(Counter.address))
  .then(() => Counter.deployed())
  .then((_instance) => console.log(_instance.address))
};
