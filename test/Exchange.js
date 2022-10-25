const { ethers } = require('hardhat');
const { expect } = require('chai');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', async ()=> {
		let deployer, feeAccount;

		beforeEach(async () => {
 		const Exchange = await ethers.getContractFactory('Token');
		exchange = await Token.deploy(feeAccount);
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		feeAccount = accounts[1];
		exchange = accounts[2];
 		})

	 	describe('Deployment', () => {
 		const name = 'Dapp University';	
 		const symbol = 'DAPP';
 		const decimals = '18';
 		const totalSupply = tokens('1000000');

	 	it('Tracks the Fee Account', async () => {
	 		expect(await exchange.feeAccount()).to.equal(feeAcount.address);
	 	})
	 })

})