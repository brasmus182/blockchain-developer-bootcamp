import { createSelector }  from 'reselect'
import { useSelector} from 'react-redux'
import { get, groupBy, reject } from 'lodash'
import { ethers } from 'ethers'
import moment from 'moment'


const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])


const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
    const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
    return(orderFilled || orderCancelled)
  })

  return openOrders

}

const decorateOrder = (order, tokens) => {
	let token0amt, token1amt, tokenPrice

	if(order.tokenGive === tokens[1].address) {
		token0amt = order.amountGive
		token1amt = order.amountGet
	} else {
		token0amt = order.amountGet
		token1amt = order.amountGive
	}
	token0amt = ethers.utils.formatEther(token0amt, 18)
	token1amt = ethers.utils.formatEther(token1amt, 18)

	let precision = 100000
	tokenPrice = (token1amt/token0amt)
	tokenPrice = Math.round(tokenPrice * precision) / precision
 
	return({
		...order,
		token0Amount: token0amt,
		token1Amount: token1amt,
		tokenPrice,
		formattedTimestamp: moment.unix(order.timeStamp).format('h:mm:ssa d MMM D') 
	})
}
export const orderBookSelector = createSelector(
	openOrders,
	tokens,
	(orders, tokens) => 
{
	if(!tokens[0] || !tokens[1]){return}
	orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
	orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

	orders = decorateOrderBookOrders(orders, tokens)

	orders = groupBy(orders, 'orderType')

	const buyOrders = get(orders, 'buy', [])
 
	orders = {
		...orders,
		buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
	}

	const sellOrders = get(orders, 'sell', [])

	orders = {
		...orders,
		sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
	}
 	
	return orders
})

const decorateOrderBookOrders = (orders, tokens) => {
	return (
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateOrderBookOrder(order, tokens)
			return(order)
		})
	)
}

const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

	return ({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
	})
}