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
	 	let transaction, result, event, args;
	 	let amount = tokens(10);

	 	describe('Success', async () => {
	 		beforeEach(async () => {
		 		transaction = await token1.connect(user1).approve(exchange.address, amount);
		 		result = await transaction.wait();

				transaction = await exchange.connect(user1).depositToken(token1.address, amount);
				result = await transaction.wait();
 			})

	 		it('Tracks the Token Deposit', async () => {
	 			expect(await token1.balanceOf(exchange.address)).to.equal(amount);
	 			expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount);
	 			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
	 		})
	 		it('Emits an Deposit Event', async () => {
	 			const event = result.events[1];
	 			expect(event.event).to.equal('Deposit');
	 			const args = event.args;
	 			expect(args.token).to.equal(token1.address);
	 			expect(args.user).to.equal(user1.address);
	 			expect(args.amount).to.equal(amount);
	 			expect(args.balance).to.equal(amount);
	 		}) 	
	 	})
	 	
	 	describe('Failure', async () => {
	 		it('Fails when no tokens are approved', async () => {
	 			await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;
	 		})	
	 	})
	 	

	})
})