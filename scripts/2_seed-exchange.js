//const config = require('../src/config.json')

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
  //Fetch deployed tokens
  const DApp = await ethers.getContractAt('Token', '0x5FbDB2315678afecb367f032d93F642f64180aa3');
  console.log(`Token fetched: ${DApp.address}`);
  const mETH = await ethers.getContractAt('Token', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
  console.log(`Token fetched: ${mETH.address}`);
  const mDAI = await ethers.getContractAt('Token', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
  console.log(`Token fetched: ${mDAI.address}`);
  const exchange = await ethers.getContractAt('Exchange', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
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


  ///////////////////
  //Seed Open Orders
  //User 1 making 10 orders
  for(var i = 0; i <= 10; i++){
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait();

    console.log(`Made order from ${user1.address}\n`)
  }
  //User 2 makes 10 orders
  for(var i = 0; i <= 10; i++){
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait();

    console.log(`Made order from ${user1.address}\n`)
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });