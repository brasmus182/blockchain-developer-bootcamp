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
			token2 = await Token.deploy('Mock DAI', 'mDAI', '18', '1000000');

			accounts = await ethers.getSigners();
			deployer = accounts[0];
			feeAccount = accounts[1];
			user1 = accounts[2];
			user2 = accounts[3];

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
	describe('Withdrawing Tokens', async () => {
	 	let transaction, result, event, args;
	 	let amount = tokens(10);

	 	describe('Success', async () => {
	 		beforeEach(async () => {
		 		transaction = await token1.connect(user1).approve(exchange.address, amount);
		 		result = await transaction.wait();

				transaction = await exchange.connect(user1).depositToken(token1.address, amount);
				result = await transaction.wait();

				transaction = await exchange.connect(user1).withdrawTokens(token1.address, amount);
				result = await transaction.wait();
 			})

	 		it('Withdraws Token funds', async () => {
	 			expect(await token1.balanceOf(exchange.address)).to.equal(0);
	 			expect(await exchange.tokens(token1.address, user1.address)).to.equal(0);
	 			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0);

	 		})
	 		it('Emits a Withdrawal Event', async () => {
	 			const event = result.events[1];
	 			expect(event.event).to.equal('Withdraw');
	 			const args = event.args;
	 			expect(args.token).to.equal(token1.address);
	 			expect(args.user).to.equal(user1.address);
	 			expect(args.amount).to.equal(amount);
	 			expect(args.balance).to.equal(0);
	 		}) 	
	 	})
	 	
	 	describe('Failure', async () => {
	 		it('Fails for insufficient balance', async () => {
	 			await expect(exchange.connect(user1).withdrawTokens(token1.address, amount)).to.be.reverted;
	 		})	
	 	})
	})

	describe('Checking Balances', async () => {
	 	let transaction, result;
	 	let amount = tokens(1);

	 		beforeEach(async () => {
		 		transaction = await token1.connect(user1).approve(exchange.address, amount);
		 		result = await transaction.wait();

				transaction = await exchange.connect(user1).depositToken(token1.address, amount);
				result = await transaction.wait();

				// transaction = await exchange.connect(user1).withdrawTokens(token1.address, 9);
				// result = await transaction.wait();
 			})

	 		it('Returns User Balance', async () => {
	 			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);

	 		})
	})

	describe('Making Orders', async () => {
		let transaction, result;
		let amount = tokens(1);

	 	describe('Success', async () => {
	 		beforeEach(async () => {
		 		transaction = await token1.connect(user1).approve(exchange.address, amount);
		 		result = await transaction.wait();

				transaction = await exchange.connect(user1).depositToken(token1.address, amount);
				result = await transaction.wait();

				transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
				result = await transaction.wait();
 			})

	 		it('Tracks the Newly Created Order', async () => {
	 			expect(await exchange.orderCount()).to.equal(1);
	 		})
	 		it('Emits an Order Event', async () => {
	 			const event = result.events[0];
	 			expect(event.event).to.equal('Order');
	 			const args = event.args;
	 			expect(args.id).to.equal(1);
	 			expect(args.user).to.equal(user1.address);
	 			expect(args.tokenGet).to.equal(token2.address);
	 			expect(args.amountGet).to.equal(amount);
	 			expect(args.tokenGive).to.equal(token1.address);
	 			expect(args.amountGive).to.equal(tokens(1));
	 			expect(args.timeStamp).to.at.least(1);
	 		})
	 	})
	 	
	 	describe('Failure', async () => {
	 		it('Rejects Orders That Have No Balance', async () => {
	 			await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted;
	 		})	
	 	})
	})

	describe('Order Actions', async () => {
		let transaction, result;
		let amount = tokens(1);

		beforeEach(async () => {
				//User One approve and deposit
	 			transaction = await token1.connect(user1).approve(exchange.address, amount);
		 		result = await transaction.wait();

		 		transaction = await exchange.connect(user1).depositToken(token1.address, amount);
				result = await transaction.wait();

				//User 2 getting tokens
				transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
				result = await transaction.wait();

				//User two depositing tokens
		 		transaction = await token2.connect(user2).approve(exchange.address, tokens(2));
		 		result = await transaction.wait();

				transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2));
				result = await transaction.wait();

				//Make Order
				transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
				result = await transaction.wait();
	 	
	 	})

		describe('Cancelling Orders', async () => {
	 		describe('Success', async () => {
	 			beforeEach(async () => {
			 		transaction = await exchange.connect(user1).cancelOrder(1);
			 		result = await transaction.wait();
	 			})
	 			it('Updates Cancelled Orders', async () => {
	 				expect(await exchange.orderCancelled(1)).to.equal(true);
	 			})
	 			it('Emits a Cancellation Event', async () => {
		 			const event = result.events[0];
		 			expect(event.event).to.equal('CancelOrder');

		 			const args = event.args;
		 			expect(args.id).to.equal(1);
		 			expect(args.user).to.equal(user1.address);
		 			expect(args.tokenGet).to.equal(token2.address);
		 			expect(args.amountGet).to.equal(tokens(1));
		 			expect(args.tokenGive).to.equal(token1.address);
		 			expect(args.amountGive).to.equal(tokens(1));
		 			expect(args.timeStamp).to.at.least(1);
	 			})
	 		})
	 		describe('Failure', async () => {
	 			beforeEach(async () => {
			 		transaction = await exchange.connect(user1).cancelOrder(1);
			 		result = await transaction.wait();
	 			})
	 			it('Rejects invalid Order IDs', async () => {
	 				await expect(exchange.connect(user1).cancelOrder(100)).to.be.reverted;
	 			})
	 			it('Rejects Cancellation by Users Other than Order Creator', async () => {
	 				await expect(exchange.connect(user2).cancelOrder(2)).to.be.reverted;
	 			})
	 		})	
	 	})

	 	describe('Filling Orders', async () => {

	 		describe('Success', async () => {
	 			beforeEach(async () => {
			 		transaction = await exchange.connect(user2).fillOrder('1');
			 		result = await transaction.wait();
	 			})

	 			it('Executes the Trade and Charges Fees', async () => {
	 				//Token Give
	 				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0));
	 				expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1));
	 				expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0));

	 				//Token Get
	 				expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1));
	 				expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9));
	 				expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1));
	 					
	 			})
	 			// it('Emits a Cancellation Event', async () => {
		 		// 	// const event = result.events[0];
		 		// 	// expect(event.event).to.equal('CancelOrder');
		 		// 	// const args = event.args;
		 		// 	// expect(args.id).to.equal(1);
		 		// 	// expect(args.user).to.equal(user1.address);
		 		// 	// expect(args.tokenGet).to.equal(token2.address);
		 		// 	// expect(args.amountGet).to.equal(amount);
		 		// 	// expect(args.tokenGive).to.equal(token1.address);
		 		// 	// expect(args.amountGive).to.equal(tokens(1));
		 		// 	// expect(args.timeStamp).to.at.least(1);
	 			// })
	 		})
	 		describe('Failure', async () => {
	 			beforeEach(async () => {
			 		// transaction = await exchange.connect(user1).cancelOrder(1);
			 		// result = await transaction.wait();
	 			})
	 			// it('Rejects invalid Order IDs', async () => {
	 			// 	await expect(exchange.connect(user1).cancelOrder(100)).to.be.reverted;
	 			// })
	 			// it('Rejects Cancellation by Users Other than Order Creator', async () => {
	 			// 	await expect(exchange.connect(user2).cancelOrder(2)).to.be.reverted;
	 			// })
	 			// it('Will not cancel an already cancelled order', async () => {
	 			// 	await expect(exchange.connect(user1).cancelOrder(1)).to.be.reverted;
	 			// })
	 		})	
	 	})
	}) 
})












