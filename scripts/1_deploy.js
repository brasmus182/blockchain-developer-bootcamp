async function main() {
  console.log('Preparing deployment...\n')
  // Fetch contracts to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  //Getting accounts
  const accounts = await ethers.getSigners()
  


  console.log(`Accounts retreived: \n${accounts[0].address}\n${accounts[1].address}`)

  // Deploy contracts
  const dapp = await Token.deploy('DAPP Token', 'DAPP', 18, 1000000)
  await dapp.deployed()
  console.log(`Dapp Token Deployed to: ${dapp.address}`)

  const mETH = await Token.deploy('mETH', 'mETH', 18, 1000000)
  await mETH.deployed()
  console.log(`mETH Token Deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy('mDAI', 'mDAI', 18, 1000000)
  await mDAI.deployed()
  console.log(`mDAI Token Deployed to: ${mDAI.address}`)
  
  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to:${exchange.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
