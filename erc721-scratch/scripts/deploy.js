const { ethers } = require("hardhat");

async function main() {
  const ERC721 = await ethers.getContractFactory("ERC721");
  const erc721 = await ERC721.deploy();

  await erc721.deployed();

  console.log("ERC721 deployed to:", erc721.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
