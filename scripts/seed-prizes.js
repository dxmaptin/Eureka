const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Prize Seeding Script for MysteryBox Contract
 * 
 * This script reads prize definitions from JSON and populates the MysteryBox contract
 * with weighted random prizes for testing and production deployment.
 * 
 * Usage: MYSTERYBOX_ADDRESS=0x... npx hardhat run scripts/seed-prizes.js --network <network>
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Prize Seeding Script Starting...");
  console.log("Deployer account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Get MysteryBox contract address from environment or use Sepolia deployment
  const MYSTERYBOX_ADDRESS = process.env.MYSTERYBOX_ADDRESS || "0x7146aC7745dDC1a3d5f01450e894b35e45592c8f";
  if (!MYSTERYBOX_ADDRESS) {
    throw new Error("MYSTERYBOX_ADDRESS environment variable is required");
  }

  console.log("MysteryBox contract address:", MYSTERYBOX_ADDRESS);

  // Load and validate prize data
  const prizeDataPath = path.join(__dirname, "../data/prize-seeds.json");
  if (!fs.existsSync(prizeDataPath)) {
    throw new Error(`Prize data file not found: ${prizeDataPath}`);
  }

  const prizeData = JSON.parse(fs.readFileSync(prizeDataPath, "utf8"));
  console.log(`Loaded ${prizeData.prizes.length} prizes from ${prizeData.name}`);
  
  // Validate prize data structure
  validatePrizeData(prizeData);

  // Connect to MysteryBox contract
  const MysteryBox = await ethers.getContractFactory("MysteryBox");
  const mysteryBox = MysteryBox.attach(MYSTERYBOX_ADDRESS);

  // Verify contract access and ownership
  await verifyContractOwnership(mysteryBox, deployer.address);

  // Check current state before seeding
  const initialPrizeCount = await mysteryBox.prizesRemaining();
  console.log(`Current prizes in contract: ${initialPrizeCount.toString()}`);

  // Execute seeding process
  console.log("\nStarting prize seeding process...");
  const seedingResult = await seedPrizes(mysteryBox, prizeData.prizes);
  
  // Verify final state
  await verifySeeding(mysteryBox, initialPrizeCount, seedingResult.successCount);
  
  // Display comprehensive summary
  displaySeedingSummary(seedingResult, prizeData);
  
  console.log("Prize seeding process completed successfully");
}

/**
 * Validates the structure and content of prize data
 */
function validatePrizeData(prizeData) {
  if (!prizeData.prizes || !Array.isArray(prizeData.prizes)) {
    throw new Error("Invalid prize data: prizes array is required");
  }
  
  if (prizeData.prizes.length === 0) {
    throw new Error("No prizes found in data file");
  }
  
  // Validate each prize entry
  prizeData.prizes.forEach((prize, index) => {
    if (!prize.uri || typeof prize.uri !== "string") {
      throw new Error(`Prize ${index + 1}: URI is required and must be a string`);
    }
    if (!prize.weight || typeof prize.weight !== "number" || prize.weight <= 0) {
      throw new Error(`Prize ${index + 1}: Weight must be a positive number`);
    }
  });
  
  console.log("Prize data validation: PASSED");
}

/**
 * Verifies contract ownership and accessibility
 */
async function verifyContractOwnership(contract, deployerAddress) {
  try {
    const owner = await contract.owner();
    if (owner.toLowerCase() !== deployerAddress.toLowerCase()) {
      throw new Error(`Access denied. Contract owner: ${owner}, Deployer: ${deployerAddress}`);
    }
    console.log("Contract ownership verification: PASSED");
  } catch (error) {
    throw new Error(`Contract verification failed: ${error.message}`);
  }
}

/**
 * Seeds prizes into the contract with comprehensive error handling
 */
async function seedPrizes(contract, prizes) {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  const gasUsed = [];

  for (let i = 0; i < prizes.length; i++) {
    const prize = prizes[i];
    
    try {
      const tx = await contract.addPrizeURI(prize.uri);
      const receipt = await tx.wait();
      
      successCount++;
      gasUsed.push(receipt.gasUsed);
      
      console.log(`[${i + 1}/${prizes.length}] Added: "${prize.description}" (${prize.rarity}, ${prize.weight}% weight)`);
      console.log(`    URI: ${prize.uri}`);
      console.log(`    Gas used: ${receipt.gasUsed.toString()}`);
      
      // Rate limiting for network stability
      if (i < prizes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } catch (error) {
      errorCount++;
      const errorMsg = `Prize ${prize.id || i + 1} ("${prize.description}"): ${error.message}`;
      errors.push(errorMsg);
      console.error(`ERROR: ${errorMsg}`);
    }
  }

  return {
    successCount,
    errorCount,
    errors,
    gasUsed,
    totalGasUsed: gasUsed.reduce((sum, gas) => sum + gas, 0n)
  };
}

/**
 * Verifies the seeding process was successful
 */
async function verifySeeding(contract, initialCount, successCount) {
  const finalCount = await contract.prizesRemaining();
  const expectedCount = initialCount + BigInt(successCount);
  
  console.log("\nSeeding Verification:");
  console.log(`  Initial prizes: ${initialCount.toString()}`);
  console.log(`  Final prizes: ${finalCount.toString()}`);
  console.log(`  Prizes added: ${(finalCount - initialCount).toString()}`);
  
  if (finalCount === expectedCount) {
    console.log("  Status: VERIFIED");
  } else {
    throw new Error(`Verification failed: Expected ${expectedCount}, got ${finalCount}`);
  }
}

/**
 * Displays comprehensive seeding summary and statistics
 */
function displaySeedingSummary(result, prizeData) {
  console.log("\n" + "=".repeat(60));
  console.log("SEEDING SUMMARY");
  console.log("=".repeat(60));
  console.log(`Successfully processed: ${result.successCount}/${prizeData.prizes.length} prizes`);
  console.log(`Errors encountered: ${result.errorCount}`);
  console.log(`Total gas used: ${result.totalGasUsed.toString()}`);
  
  if (result.gasUsed.length > 0) {
    const avgGas = result.totalGasUsed / BigInt(result.gasUsed.length);
    console.log(`Average gas per transaction: ${avgGas.toString()}`);
  }
  
  if (result.errors.length > 0) {
    console.log("\nERROR DETAILS:");
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Rarity distribution analysis
  console.log("\nRARITY DISTRIBUTION:");
  const rarityStats = {};
  prizeData.prizes.forEach(prize => {
    rarityStats[prize.rarity] = (rarityStats[prize.rarity] || 0) + prize.weight;
  });
  
  Object.entries(rarityStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rarity, weight]) => {
      const percentage = (weight / prizeData.totalWeight * 100).toFixed(1);
      console.log(`  ${rarity.toUpperCase().padEnd(12)} ${percentage.padStart(5)}%`);
    });
}

// Script execution with proper error handling
main()
  .then(() => {
    console.log("\nScript execution completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript execution failed:");
    console.error(error.message);
    if (error.stack && process.env.DEBUG) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  });