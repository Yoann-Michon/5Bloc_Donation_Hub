import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);


  const DonationBadge = await ethers.getContractFactory("DonationBadge");
  const donationBadge = await DonationBadge.deploy();
  await donationBadge.waitForDeployment();
  const badgeAddress = await donationBadge.getAddress();
  console.log(`DonationBadge deployed to: ${badgeAddress}`);


  const BadgeMarketplace = await ethers.getContractFactory("BadgeMarketplace");
  const badgeMarketplace = await BadgeMarketplace.deploy(badgeAddress);
  await badgeMarketplace.waitForDeployment();
  const marketplaceAddress = await badgeMarketplace.getAddress();
  console.log(`BadgeMarketplace deployed to: ${marketplaceAddress}`);


  await new Promise((resolve) => setTimeout(resolve, 2000));
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
