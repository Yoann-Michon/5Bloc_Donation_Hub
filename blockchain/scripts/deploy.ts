import { ethers } from "hardhat";

async function main() {
  const DonationBadge = await ethers.getContractFactory("DonationBadge");
  const donationBadge = await DonationBadge.deploy();

  await donationBadge.waitForDeployment();

  console.log(
    `DonationBadge deployed to: ${await donationBadge.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
