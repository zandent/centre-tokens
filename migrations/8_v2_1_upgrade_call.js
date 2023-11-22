const some = require("lodash/some");

const V2_1Upgrader = artifacts.require("V2_1Upgrader");

module.exports = async (deployer, network) => {
  if (!some(["development", "coverage"], (v) => network.includes(v))) {
    let v2_1Upgrader = (await V2_1Upgrader.deployed()).address;
    v2_1Upgrader = await V2_1Upgrader.at(v2_1Upgrader);
    await v2_1Upgrader.upgrade();
    console.log(`>>>>>>> V2Upgrader upgraded <<<<<<<`);
  }
};
