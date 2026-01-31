import { ethers } from "hardhat";

async function main() {
  const DonationBadge = await ethers.getContractFactory("DonationBadge");
  const donationBadge = await DonationBadge.deploy();

  await donationBadge.waitForDeployment();

  const address = await donationBadge.getAddress();
  console.log(`DonationBadge deployed to: ${address}`);

  // Small delay to allow logging to flush
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
