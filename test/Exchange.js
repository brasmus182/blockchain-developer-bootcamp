const { ethers } = require('hardhat');
const { expect } = require('chai');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', async ()=> {
		let deployer, feeAccount, exchange;

		const feePercent = 10;

		beforeEach(async () => {
			const Exchange = await ethers.getContractFactory('Exchange');
			const Token = await ethers.getContractFactory('Token');
			token1 = await Token.deploy('Dapp University', 'DAPP', '18', '1000000');

			accounts = await ethers.getSigners();
			deployer = accounts[0];
			feeAccount = accounts[1];
			user1 = accounts[2];

			let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
			
			exchange = await Exchange.deploy(feeAccount.address, feePercent);
 		})

	 describe('Deployment', async () => {

	 	it('Tracks the Fee Account', async () => {
	 		expect(await exchange.feeAccount()).to.equal(feeAccount.address);
	 	})
	 	it('Tracks the Fee Percent', async() => {
	 		expect(await exchange.feePercent()).to.equal(feePercent);
	 	})
	 })
	 describe('Depositing Tokens', async () => {
	 	let transaction, result;
	 	let amount = tokens(10);
	 	
	 	beforeEach(async () => {
	 		//console.log(user1.address, exchange.address, amount.toString())

	 		transaction = await token1.connect(user1).approve(exchange.address, amount);
	 		result = await transaction.wait();

			transaction = await exchange.connect(user1).depositToken(token1.address, amount);
			result = await transaction.wait();
 		})

	 	describe('Success', async () => {
	 		it('Tracks the Token Deposit', async () => {
	 			expect(await token1.balanceOf(exchange.address)).to.equal(amount);
	 		})
	 	})
	 	
	 	describe('Failure', async () => {
	 		it('Failure', async () => {
	 			//expect(await exchange.feeAccount()).to.equal(feeAccount.address);
	 		})	
	 	})
	 	

	})
})