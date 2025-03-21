const fs = require("fs");
const path = require("path");
const some = require("lodash/some");

const FiatTokenV1 = artifacts.require("FiatTokenV1");
const FiatTokenProxy = artifacts.require("FiatTokenProxy");
let proxyContractAddress = "";
let masterMinterAddress = "";
let ownerAddress = "";
let proxyadminAddress = "";
// Read config file if it exists
if (fs.existsSync(path.join(__dirname, "..", "config.js"))) {
  ({
    PROXY_CONTRACT_ADDRESS: proxyContractAddress,
    MASTERMINTER_ADDRESS_FINAL: masterMinterAddress,
    OWNER_ADDRESS_FINAL: ownerAddress,
    PROXY_ADMIN_ADDRESS_FINAL: proxyadminAddress,
  } = require("../config.js"));
}
module.exports = async (deployer, network) => {
  if (!some(["development", "coverage"], (v) => network.includes(v))) {
    proxyContractAddress =
      proxyContractAddress || (await FiatTokenProxy.deployed()).address;
    let proxyContractAddressInstance = await FiatTokenProxy.at(
      proxyContractAddress
    );
    await proxyContractAddressInstance.changeAdmin(proxyadminAddress, {
      from: deployer.provider.getAddress(2),
    });
    console.log(`>>>>>>> changed Admin to ${proxyadminAddress} <<<<<<<`);
    proxyContractAddressInstance = await FiatTokenV1.at(proxyContractAddress);
    await proxyContractAddressInstance.updateMasterMinter(masterMinterAddress, {
      from: deployer.provider.getAddress(0),
    });
    console.log(
      `>>>>>>> updated MasterMinter to ${masterMinterAddress} <<<<<<<`
    );
    await proxyContractAddressInstance.transferOwnership(ownerAddress, {
      from: deployer.provider.getAddress(0),
    });
    console.log(
      `>>>>>>> transferred Token Ownership to ${ownerAddress} <<<<<<<`
    );
  }
};
