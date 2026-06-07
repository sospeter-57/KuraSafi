const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const KuraSafi = await hre.ethers.getContractFactory("KuraSafi");
  const kura = await KuraSafi.deploy();
  await kura.waitForDeployment();

  console.log("KuraSafi deployed to:", await kura.getAddress());

  const envPath = path.join(__dirname, "..", "..", "frontend", ".env.local");
  const envContent = `VITE_CONTRACT_ADDRESS=${kura.address}\n`;
  fs.writeFileSync(envPath, envContent, "utf8");
  console.log(`Wrote deployed contract address to ${envPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
