import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BadgeMarketplace", function () {
    async function deployMarketplaceFixture() {
        const [owner, buyer, other] = await ethers.getSigners();

        const DonationBadge = await ethers.getContractFactory("DonationBadge");
        const donationBadge = await DonationBadge.deploy();

        const BadgeMarketplace = await ethers.getContractFactory("BadgeMarketplace");
        const badgeMarketplace = await BadgeMarketplace.deploy(await donationBadge.getAddress());

        const donationAmount = ethers.parseEther("0.1");
        await donationBadge.donate(1, "ipfs://test", { value: donationAmount });

        await time.increase(11 * 60);

        return { donationBadge, badgeMarketplace, owner, buyer, other };
    }

    describe("Listing", function () {
        it("Should allow listing a badge", async function () {
            const { donationBadge, badgeMarketplace, owner } = await loadFixture(deployMarketplaceFixture);

            await donationBadge.setApprovalForAll(await badgeMarketplace.getAddress(), true);

            await badgeMarketplace.listBadge(1, ethers.parseEther("1.0"));

            const listing = await badgeMarketplace.listings(1);
            expect(listing.active).to.be.true;
            expect(listing.price).to.equal(ethers.parseEther("1.0"));
        });
    });

    describe("Buying", function () {
        it("Should allow buying a badge", async function () {
            const { donationBadge, badgeMarketplace, owner, buyer } = await loadFixture(deployMarketplaceFixture);

            await donationBadge.setApprovalForAll(await badgeMarketplace.getAddress(), true);
            await badgeMarketplace.listBadge(1, ethers.parseEther("1.0"));

            const marketplaceAsBuyer = badgeMarketplace.connect(buyer);
            await marketplaceAsBuyer.buyBadge(1, { value: ethers.parseEther("1.0") });

            expect(await donationBadge.ownerOf(1)).to.equal(buyer.address);
        });

        it("Should fail buy if Buyer has max badges (4)", async function () {
            const { donationBadge, badgeMarketplace, owner, buyer } = await loadFixture(deployMarketplaceFixture);

            await donationBadge.setApprovalForAll(await badgeMarketplace.getAddress(), true);
            await badgeMarketplace.listBadge(1, ethers.parseEther("1.0"));

            const badgeAsBuyer = donationBadge.connect(buyer);
            for (let i = 0; i < 4; i++) {
                await badgeAsBuyer.donate(1, `ipfs://buyer-${i}`, { value: ethers.parseEther("0.1") });
                await time.increase(5 * 60 + 1);
            }

            const marketplaceAsBuyer = badgeMarketplace.connect(buyer);
            await expect(marketplaceAsBuyer.buyBadge(1, { value: ethers.parseEther("1.0") }))
                .to.be.revertedWith("Limite de possession atteinte (4 max)");
        });
    });

    describe("Cancellation", function () {
        it("Should allow seller to cancel a listing", async function () {
            const { donationBadge, badgeMarketplace, owner } = await loadFixture(deployMarketplaceFixture);

            await donationBadge.setApprovalForAll(await badgeMarketplace.getAddress(), true);
            await badgeMarketplace.listBadge(1, ethers.parseEther("1.0"));

            await badgeMarketplace.cancelListing(1);

            const listing = await badgeMarketplace.listings(1);
            expect(listing.active).to.be.false;
        });

        it("Should fail to buy a cancelled listing", async function () {
            const { donationBadge, badgeMarketplace, owner, buyer } = await loadFixture(deployMarketplaceFixture);

            await donationBadge.setApprovalForAll(await badgeMarketplace.getAddress(), true);
            await badgeMarketplace.listBadge(1, ethers.parseEther("1.0"));

            await badgeMarketplace.cancelListing(1);

            const marketplaceAsBuyer = badgeMarketplace.connect(buyer);
            await expect(marketplaceAsBuyer.buyBadge(1, { value: ethers.parseEther("1.0") }))
                .to.be.revertedWith("Listing not active");
        });
    });
});
