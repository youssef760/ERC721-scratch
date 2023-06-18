const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ERC721 contract", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const erc721 = await ethers.deployContract("ERC721");

    await erc721.waitForDeployment(); // Wait for deployment transaction to be mined
    return { erc721, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("should return the balance", async function() {
      const { erc721, owner } = await loadFixture(deployTokenFixture);
      const result = await erc721.balanceOf(owner.address);
      expect(result).to.equal(0);
    });

    it('should return the owner', async function () {
      const { erc721, owner, addr1 } = await loadFixture(deployTokenFixture);
      await erc721.mint(owner.address, 1);
      const tokenId = 1;
      await erc721.transferFrom(owner.address, addr1.address, tokenId);
      const result = await erc721.ownerOf(tokenId);
      expect(result).to.equal(addr1.address);
    })

    it('should reject invalid token ID', async function() {
      const { erc721 } = await loadFixture(deployTokenFixture);
      const tokenId = 99;
      await expect(erc721.ownerOf(tokenId)).to.be.revertedWith('TokenID does not exist');
    });


    it('should mint new token', async function() {
      const { erc721, owner, addr1 } = await loadFixture(deployTokenFixture);
      const tokenId = 1;
      const balanceBefore = await erc721.balanceOf(addr1.address);
      console.log(`balance before: ${balanceBefore}`);
      expect(balanceBefore).to.equal(0);
      const result = await erc721.mint(addr1.address, tokenId, { from: owner.address });
      const balanceAfter = await erc721.balanceOf(addr1.address);
      console.log(`balance after: ${balanceAfter}`);
      expect(balanceAfter).to.equal(1);
    });

    it('should reject invalid recipient', async function() {
      const { erc721, owner } = await loadFixture(deployTokenFixture);
      const tokenId = 1;
      const invalidRecipient = "0x0000000000000000000000000000000000000000";
  
      await expect(erc721.mint(invalidRecipient, tokenId, { owner: owner.address })).to.be.revertedWith('Invalid recipient address');
    });

    
    it('should reject token ID that already exists', async function() {
      const { erc721, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const tokenId = 1;

      // Mint the token with the given ID
      await erc721.mint(addr1.address, tokenId, { from: owner.address });

      // Attempt to mint a token with the same ID again
      await expect(
        erc721.mint(addr2.address, tokenId, { from: owner.address })
      ).to.be.revertedWith('Token with given ID already exists');
    });

    it('should transfer TokenID to recipient using transferFrom', async function () {
      const { erc721, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const tokenId = 1;

      // Mint the token and transfer ownership to addr1
      await erc721.mint(addr1.address, tokenId, { from: owner.address });

      const balanceBefore1 = await erc721.balanceOf(addr1.address);
      console.log(`balance before addr1: ${balanceBefore1}`);
      expect(balanceBefore1).to.equal(1);

      const balanceBefore2 = await erc721.balanceOf(addr2.address);
      console.log(`balance before addr2: ${balanceBefore2}`);
      expect(balanceBefore2).to.equal(0);

      // Approve addr2 to transfer the token
      await erc721.connect(addr1).approve(addr2.address, tokenId);

      // Transfer the token from addr1 to addr2 using transferFrom
      await erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);

      const balanceAfter1 = await erc721.balanceOf(addr1.address);
      console.log(`balance after addr1: ${balanceAfter1}`);
      expect(balanceAfter1).to.equal(0);

      const balanceAfter2 = await erc721.balanceOf(addr2.address);
      console.log(`balance after addr2: ${balanceAfter2}`);
      expect(balanceAfter2).to.equal(1);
    });

    it('should approve token transfer', async function () {
      const { erc721, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const tokenId = 1;

      // Mint the token and transfer ownership to addr1
      await erc721.mint(addr1.address, tokenId, { from: owner.address });

      // Approve addr2 to transfer the token
      await erc721.connect(addr1).approve(addr2.address, tokenId);

      // Check the approved address for the token
      const approvedAddress = await erc721.getApproved(tokenId);
      expect(approvedAddress).to.equal(addr2.address);
    });

    it('should set approval for operator', async function () {
      const { erc721, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

      // Set approval for addr2 as an operator for addr1
      await erc721.connect(addr1).setApprovalForAll(addr2.address, true);

      // Check if addr2 is an approved operator for addr1
      const isApproved = await erc721.isApprovedForAll(addr1.address, addr2.address);
      expect(isApproved).to.equal(true);
    });

  });
});
