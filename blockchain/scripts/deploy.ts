import hre from "hardhat";

async function main() {
  const donationBadge = await hre.ethers.deployContract("DonationBadge");
  await donationBadge.waitForDeployment();
  console.log(`DonationBadge deployed to: ${await donationBadge.getAddress()}`);

  // Small delay to allow logging to flush
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
