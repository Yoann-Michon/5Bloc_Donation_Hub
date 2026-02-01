import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Deploy DonationBadge
  const DonationBadge = await ethers.getContractFactory("DonationBadge");
  const donationBadge = await DonationBadge.deploy();
  await donationBadge.waitForDeployment();
  const badgeAddress = await donationBadge.getAddress();
  console.log(`DonationBadge deployed to: ${badgeAddress}`);

  // Deploy BadgeMarketplace
  const BadgeMarketplace = await ethers.getContractFactory("BadgeMarketplace");
  const badgeMarketplace = await BadgeMarketplace.deploy(badgeAddress);
  await badgeMarketplace.waitForDeployment();
  const marketplaceAddress = await badgeMarketplace.getAddress();
  console.log(`BadgeMarketplace deployed to: ${marketplaceAddress}`);

  // Small delay to allow logging to flush
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
