import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Learnopoly contract...");

  const LearnopolyFactory = await ethers.getContractFactory("Learnopoly");
  const learnopoly = await LearnopolyFactory.deploy();

  await learnopoly.waitForDeployment();

  const address = await learnopoly.getAddress();
  console.log(`Learnopoly deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
