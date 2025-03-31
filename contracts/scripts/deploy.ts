// import { ethers } from "hardhat";

// async function main() {
//   console.log("Deploying Learnopoly contract...");

//   const LearnopolyFactory = await ethers.getContractFactory("Learnopoly");
//   const learnopoly = await LearnopolyFactory.deploy();

//   await learnopoly.waitForDeployment();

//   const address = await learnopoly.getAddress();
//   console.log(`Learnopoly deployed to: ${address}`);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying Learnopoly contract...");

  const LearnopolyFactory = await ethers.getContractFactory("Learnopoly");
  const learnopoly = await LearnopolyFactory.deploy();

  await learnopoly.waitForDeployment();

  const address = await learnopoly.getAddress();
  console.log(`Learnopoly deployed to: ${address}`);

  // Get the ABI from the contract artifact
  const artifact = require("../artifacts/contracts/Learnopoly.sol/Learnopoly.json");

  // Create frontend directory if it doesn't exist
  const frontendDir = path.join(__dirname, "../frontend/lib");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Save the ABI to a file in the frontend directory
  fs.writeFileSync(
    path.join(frontendDir, "LearnopolyABI.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log(
    `ABI written to: ${path.join(frontendDir, "LearnopolyABI.json")}`
  );

  // Save the contract address to a file in the frontend directory
  fs.writeFileSync(
    path.join(frontendDir, "contract-address.json"),
    JSON.stringify({ address }, null, 2)
  );
  console.log(
    `Contract address written to: ${path.join(
      frontendDir,
      "contract-address.json"
    )}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
