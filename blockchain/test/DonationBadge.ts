import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DonationBadge", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployDonationBadgeFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const DonationBadge = await ethers.getContractFactory("DonationBadge");
    const donationBadge = await DonationBadge.deploy();

    return { donationBadge, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should start with 0 badges", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      expect(await donationBadge.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe("Donations and Minting", function () {
    it("Should mint a Bronze badge for low donation", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      
      const donationAmount = ethers.parseEther("0.1");
      await donationBadge.donate(1, "ipfs://bronze-badge-metadata", { value: donationAmount });

      expect(await donationBadge.balanceOf(owner.address)).to.equal(1);
      expect(await donationBadge.tokenURI(0)).to.equal("ipfs://bronze-badge-metadata");
    });

    it("Should mint a Silver badge for >= 0.5 ETH", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      
      const donationAmount = ethers.parseEther("0.5");
      await donationBadge.donate(1, "ipfs://silver-badge-metadata", { value: donationAmount });

      expect(await donationBadge.tokenURI(0)).to.equal("ipfs://silver-badge-metadata");
    });

    it("Should mint a Gold badge for >= 1.0 ETH", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      
      const donationAmount = ethers.parseEther("1.0");
      await donationBadge.donate(1, "ipfs://gold-badge-metadata", { value: donationAmount });

      expect(await donationBadge.tokenURI(0)).to.equal("ipfs://gold-badge-metadata");
    });
  });

  describe("Limits and Constraints", function () {
    it("Should fail if user already has 4 badges", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      
      const donationAmount = ethers.parseEther("0.1");

      // Mint 4 badges
      for(let i=0; i<4; i++) {
          await donationBadge.donate(1, `ipfs://badge-${i}`, { value: donationAmount });
          // Advance time to bypass cooldown
          await time.increase(5 * 60 + 1); 
      }

      expect(await donationBadge.balanceOf(owner.address)).to.equal(4);

      // Try 5th
      await expect(donationBadge.donate(1, "ipfs://badge-5", { value: donationAmount }))
        .to.be.revertedWith("Cannot hold more than 4 badges");
    });

    it("Should fail if user donates twice in < 5 minutes", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      
      const donationAmount = ethers.parseEther("0.1");

      // First donation
      await donationBadge.donate(1, "ipfs://badge-1", { value: donationAmount });

      // Immediate second donation attempt
      await expect(donationBadge.donate(1, "ipfs://badge-2", { value: donationAmount }))
        .to.be.revertedWith("Cooldown active: wait 5 minutes");
    });

    it("Should allow donation after 5 minutes", async function () {
        const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);

        const donationAmount = ethers.parseEther("0.1");
  
        // First donation
        await donationBadge.donate(1, "ipfs://badge-1", { value: donationAmount });
  
        // Wait 5 minutes
        await time.increase(5 * 60);
  
        // Second donation should succeed
        await expect(donationBadge.donate(1, "ipfs://badge-2", { value: donationAmount })).not.to.be.reverted;
        expect(await donationBadge.balanceOf(owner.address)).to.equal(2);
      });
  });

  describe("Transfers", function () {
      it("Should enforce cooldown on transfers", async function () {
        const { donationBadge, owner, otherAccount } = await loadFixture(deployDonationBadgeFixture);
        const donationAmount = ethers.parseEther("0.1");

        await donationBadge.donate(1, "ipfs://badge-1", { value: donationAmount });

        // Try to transfer immediately
        await expect(donationBadge.transferFrom(owner.address, otherAccount.address, 0))
            .to.be.revertedWith("Cooldown active for sender");

        // Wait 5 mins
        await time.increase(5 * 60);

        // Should succeed now
        await expect(donationBadge.transferFrom(owner.address, otherAccount.address, 0))
            .not.to.be.reverted;
        
        expect(await donationBadge.ownerOf(0)).to.equal(otherAccount.address);
      });
  });
});
