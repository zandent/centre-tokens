const some = require("lodash/some");

const V2Upgrader = artifacts.require("V2Upgrader");

module.exports = async (deployer, network) => {
  if (!some(["development", "coverage"], (v) => network.includes(v))) {
    let v2Upgrader = (await V2Upgrader.deployed()).address;
    v2Upgrader = await V2Upgrader.at(v2Upgrader);
    await v2Upgrader.upgrade();
    console.log(`>>>>>>> V2Upgrader upgraded <<<<<<<`);
  }
};
