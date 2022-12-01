import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({type: 'PROVIDER_LOADED', connection })

    return connection
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork()
	dispatch({type: 'NETWORK_LOADED', chainId })

	return chainId
}

export const loadAccount = async (provider, dispatch) => {
	const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
	const account = ethers.utils.getAddress(accounts[0])

	dispatch({type: 'ACCOUNT_LOADED', account})

	let balance = await provider.getBalance(account)
	balance = ethers.utils.formatEther(balance)

	dispatch({type: 'ETHER_BALANCE_LOADED', balance})

	return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
	let token, symbol;

	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
	symbol = await token.symbol()

	dispatch({type: 'TOKEN_1_LOADED', token, symbol})

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
	symbol = await token.symbol()

	dispatch({type: 'TOKEN_2_LOADED', token, symbol})

	return token
}

export const loadExchange = async (provider, address, dispatch) => {
	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
	dispatch({ type: 'EXCHANGE_LOADED', exchange})



	return exchange 
}

export const subscribeToEvents = (exchange, dispatch) => {
	exchange.on('Deposit', (token, user, amount, balance, event) => {
		dispatch({type: 'TRANSFER_SUCCESS', event})
	})
	exchange.on('Withdraw', (token, user, amount, balance, event) => {
		dispatch({type: 'TRANSFER_SUCCESS', event})
	})
	exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timeStamp, event) => {
		const order = event.args
		dispatch({type: 'NEW_ORDER_SUCCESS', order, event})
	})
}

export const loadBalances = async (exchange, tokens, account, dispatch) => {

	let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18);
	//console.log('Token_1_Balance_LOADED', balance)
	dispatch({type: 'TOKEN_1_BALANCE_LOADED', balance})

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18);
	console.log('Token_1_EXCHANGE_BALANCE_LOADED', balance)
	dispatch({type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance})
	
	balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
	//console.log('Token_2_Balance_LOADED', balance)
	dispatch({type: 'TOKEN_2_BALANCE_LOADED', balance})

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18);
	console.log('Token_2_Exchange_Balance_LOADED', balance)
	dispatch({type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance})
	
}

export const loadAllOrders = async (provider, exchange, dispatch) => {
	const block = await provider.getBlockNumber()

	const cancelStream = await exchange.queryFilter('CancelOrder', 0, block)
	const cancelledOrders = cancelStream.map(event => event.args)

	dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders})

	const fillStream = await exchange.queryFilter('Trade', 0, block)
	const filledOrders = fillStream.map(event => event.args)

	dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders})

	const orderStream = await exchange.queryFilter('Order', 0, block)
	const allOrders = orderStream.map(event => event.args)

	dispatch({type: 'ALL_ORDERS_LOADED', allOrders})
}



export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
	let transaction

	dispatch({type: 'TRANSFER_REQUEST'})

	try{

		const signer = await provider.getSigner()
		const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

		if(transferType === 'Deposit'){
			
			transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
			await transaction.wait()

			transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)

			await transaction.wait()

		} else {
			
			transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
			await transaction.wait()

			transaction = await exchange.connect(signer).withdrawTokens(token.address, amountToTransfer)

			await transaction.wait()
		}
		
	}catch (error){
		dispatch({type: 'TRANSFER_FAIL'})
		console.log(error)
	}	
}

export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {

	
	const tokenGet = tokens[0].address
	const amountGet = ethers.utils.parseUnits(order.amount, 18)
	const tokenGive = tokens[1].address 
	const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

	dispatch({type: 'NEW_ORDER_REQUEST'})

	try{
		const signer = await provider.getSigner()
		const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
		const txdeets = await transaction.wait()
		console.log(txdeets)
	} catch(error) {
		console.log(error)
		dispatch({type: 'NEW_ORDER_FAIL'})
	}
}

export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {

	
	const tokenGet = tokens[1].address
	const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
	const tokenGive = tokens[0].address 
	const amountGive = ethers.utils.parseUnits((order.amount).toString(), 18)

	dispatch({type: 'NEW_ORDER_REQUEST'})

	try{
		const signer = await provider.getSigner()
		const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
		await transaction.wait()
	} catch(error) {
		console.log(error)
		dispatch({type: 'NEW_ORDER_FAIL'})
	}
}

export const cancelOrder = async (provider, exchange, order, dispatch) => {

  dispatch({ type: 'ORDER_CANCEL_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).cancelOrder(order.id)
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'ORDER_CANCEL_FAIL' })
  }
}
