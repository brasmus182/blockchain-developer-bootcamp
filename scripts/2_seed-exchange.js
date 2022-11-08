const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {
  console.log('Preparing deployment...\n')
  //Fetch accounts from wallet -- these are unlocked
  const accounts = await ethers.getSigners();
 
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using Chain ID: ${chainId}`);

  //Fetch deployed tokens
  const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address);
  console.log(`Token fetched: ${DApp.address}`);
  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
  console.log(`Token fetched: ${mETH.address}`);
  const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address);
  console.log(`Token fetched: ${mDAI.address}`);
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
  console.log(`Exchanged fetched: ${exchange.address}`);

  //Distribute tokens
  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(100000);

  //User1 transfers 10,000 mETH
  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`);
  await transaction.wait();

  //Set up exchange users
  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(10000);

  
  //User 1 approving and depositing Dapp token
  transaction = await DApp.connect(user1).approve(exchange.address, amount);
  await transaction.wait();



  //console.log('exchange', exchange);

  transaction = await exchange.connect(user1).depositToken(DApp.address, amount);
  await transaction.wait();
  
  //User2 approving and depositing mETH token
  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();

  transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
  await transaction.wait();
  
  //User 1 makes order to get tokens
  //Make Orders
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(100), )
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);
  

  let orderId = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order from ${user1.address}\n`)

  //wait
  await wait(1);


  //Fill Orders
  //User 1 makes order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(100))
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //Get order id from transaction
  orderId = result.events[0].args.id;

  //User 2 fills order
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`)

  await wait(1);

  //User 1 makes 2nd order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //Get order id from transaction
  orderId = result.events[0].args.id;

  //User 2 fills 2nd order
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`)

  await wait(1);

   //User 1 makes 3rd order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //Get order id from transaction
  orderId = result.events[0].args.id;

  //User 2 fills 3rd order
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`)

  await wait(1);


  ///////////////////
  //Seed Open Orders
  //User 1 making 10 orders
  for(var i = 0; i <= 10; i++){
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait();

    console.log(`Made order from ${user1.address}\n`)

    await wait(1);
  }
  //User 2 makes 10 orders
  for(var i = 0; i <= 10; i++){
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait();

    console.log(`Made order from ${user1.address}\n`)

    await wait(1);
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });