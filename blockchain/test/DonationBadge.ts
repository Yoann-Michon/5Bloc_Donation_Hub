import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DonationBadge", function () {
  async function deployDonationBadgeFixture() {
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const DonationBadge = await ethers.getContractFactory("DonationBadge");
    const donationBadge = await DonationBadge.deploy();

    return { donationBadge, owner, otherAccount, thirdAccount };
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
      await donationBadge.donate(1, "ipfs://bronze", { value: donationAmount });

      expect(await donationBadge.balanceOf(owner.address)).to.equal(1);
    });
  });

  describe("Limits and Constraints", function () {
    it("Should fail if user tries to exceed 4 badges", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      const donationAmount = ethers.parseEther("0.1");

      for (let i = 0; i < 4; i++) {
        await donationBadge.donate(1, `ipfs://badge-${i}`, { value: donationAmount });
        await time.increase(5 * 60 + 1);
      }

      expect(await donationBadge.balanceOf(owner.address)).to.equal(4);

      await expect(donationBadge.donate(1, "ipfs://badge-5", { value: donationAmount }))
        .to.be.revertedWith("Limite de possession atteinte (4 max)");
    });

    it("Should enforce Cooldown (5 mins) between donations", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      const donationAmount = ethers.parseEther("0.1");

      await donationBadge.donate(1, "ipfs://badge-1", { value: donationAmount });

      await expect(donationBadge.donate(1, "ipfs://badge-2", { value: donationAmount }))
        .to.be.revertedWith("Cooldown de 5 minutes actif");

      await time.increase(5 * 60 + 1);

      await expect(donationBadge.donate(1, "ipfs://badge-2", { value: donationAmount }))
        .not.to.be.reverted;
    });


  });

  describe("Transfers", function () {
    it("Should check Max Badges limit on Receiver", async function () {
      const { donationBadge, owner, otherAccount } = await loadFixture(deployDonationBadgeFixture);
      const donationAmount = ethers.parseEther("0.1");

      await donationBadge.donate(1, "ipfs://owner", { value: donationAmount });
      await time.increase(11 * 60);

      const otherBadge = donationBadge.connect(otherAccount);
      for (let i = 0; i < 4; i++) {
        await otherBadge.donate(1, `ipfs://other-${i}`, { value: donationAmount });
        await time.increase(5 * 60 + 1);
      }

      await expect(donationBadge.transferFrom(owner.address, otherAccount.address, 1))
        .to.be.revertedWith("Limite de possession atteinte (4 max)");
    });
  });

  describe("Fusion", function () {
    it("Should fuse 2 Bronze badges into 1 Silver", async function () {
      const { donationBadge, owner } = await loadFixture(deployDonationBadgeFixture);
      const donationAmount = ethers.parseEther("0.1");

      await donationBadge.donate(1, "ipfs://bronze1", { value: donationAmount });
      await time.increase(5 * 60 + 1);
      await donationBadge.donate(1, "ipfs://bronze2", { value: donationAmount });

      expect(await donationBadge.balanceOf(owner.address)).to.equal(2);

      const tokenId1 = 1;
      const tokenId2 = 2;

      await donationBadge.fuseBadges(tokenId1, tokenId2, "ipfs://silver");

      expect(await donationBadge.balanceOf(owner.address)).to.equal(1);

      expect(await donationBadge.getTierFromTokenId(3)).to.equal(1);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow owner to withdraw project funds", async function () {
      const { donationBadge, owner, otherAccount } = await loadFixture(deployDonationBadgeFixture);
      const donationAmount = ethers.parseEther("1.0");

      await donationBadge.setProjectOwner(1, otherAccount.address);

      await donationBadge.donate(1, "ipfs://badge", { value: donationAmount });

      expect(await ethers.provider.getBalance(await donationBadge.getAddress())).to.equal(donationAmount);

      const balanceBefore = await ethers.provider.getBalance(otherAccount.address);

      await donationBadge.withdrawProjectFunds(1, otherAccount.address);

      const balanceAfter = await ethers.provider.getBalance(otherAccount.address);
      expect(balanceAfter).to.equal(balanceBefore + donationAmount);
    });
  });
});
