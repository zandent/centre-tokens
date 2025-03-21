const fs = require("fs");
const path = require("path");
const some = require("lodash/some");

const FiatTokenV2 = artifacts.require("FiatTokenV2");
const FiatTokenProxy = artifacts.require("FiatTokenProxy");
const V2Upgrader = artifacts.require("V2Upgrader");

let proxyAdminAddress = "";
let proxyContractAddress = "";

// Read config file if it exists
if (fs.existsSync(path.join(__dirname, "..", "config.js"))) {
  ({
    PROXY_ADMIN_ADDRESS: proxyAdminAddress,
    PROXY_CONTRACT_ADDRESS: proxyContractAddress,
  } = require("../config.js"));
}

module.exports = async (deployer, network) => {
  if (some(["development", "coverage"], (v) => network.includes(v))) {
    // DO NOT USE THIS ADDRESS IN PRODUCTION
    proxyAdminAddress = "0x2F560290FEF1B3Ada194b6aA9c40aa71f8e95598";
    proxyContractAddress = (await FiatTokenProxy.deployed()).address;
  }
  proxyContractAddress =
    proxyContractAddress || (await FiatTokenProxy.deployed()).address;

  const fiatTokenV2 = await FiatTokenV2.deployed();

  console.log(`Proxy Admin:     ${proxyAdminAddress}`);
  console.log(`FiatTokenProxy:  ${proxyContractAddress}`);
  console.log(`FiatTokenV2:     ${fiatTokenV2.address}`);

  if (!proxyAdminAddress) {
    throw new Error("PROXY_ADMIN_ADDRESS must be provided in config.js");
  }

  console.log("Deploying V2Upgrader contract...");

  const v2Upgrader = await deployer.deploy(
    V2Upgrader,
    proxyContractAddress,
    fiatTokenV2.address,
    proxyAdminAddress,
    "AxCNH"
  );

  console.log(`>>>>>>> Deployed V2Upgrader at ${v2Upgrader.address} <<<<<<<`);
  if (!some(["development", "coverage"], (v) => network.includes(v))) {
    const FiatTokenV1 = artifacts.require("FiatTokenV1");
    let proxyContractAddressInstance = await FiatTokenV1.at(
      proxyContractAddress
    );
    await proxyContractAddressInstance.configureMinter(
      deployer.provider.getAddress(0),
      "200000"
    );
    console.log(
      `>>>>>>> Set ${deployer.provider.getAddress(
        0
      )} as minter. Allowance: 0.2 <<<<<<<`
    );
    await proxyContractAddressInstance.mint(v2Upgrader.address, "200000");
    console.log(`>>>>>>> Mint 0.2 to v2Upgrader ${v2Upgrader.address} <<<<<<<`);
    proxyContractAddressInstance = await FiatTokenProxy.at(
      proxyContractAddress
    );
    await proxyContractAddressInstance.changeAdmin(v2Upgrader.address, {
      from: deployer.provider.getAddress(2),
    });
    console.log(
      `>>>>>>> Admin changed to v2Upgrader ${v2Upgrader.address} on proxy ${proxyContractAddress} <<<<<<<`
    );
    // await v2Upgrader.upgrade();
    // console.log(
    //   `>>>>>>> V2Upgrader upgraded for proxy ${proxyContractAddress} at impl ${fiatTokenV2.address} <<<<<<<`
    // );
  }
};
