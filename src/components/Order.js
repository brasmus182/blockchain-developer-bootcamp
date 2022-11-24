import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeBuyOrder, makeBuyOrder2, makeSellOrder } from '../store/interactions'

const Order = () => {

const dispatch = useDispatch()
const provider = useSelector(state => state.provider.connection)
const tokens = useSelector(state => state.tokens.contracts)
const exchange = useSelector(state => state.exchange.contract)

const [isBuy, setIsBuy] = useState(true)
const [amount, setAmount] = useState(0)
const [price, setPrice] = useState(0)

const buyRef = useRef(null)
const sellRef = useRef(null)

const buyHandler = (e) => {
  e.preventDefault()
  makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
  //makeBuyOrder2(provider, exchange, tokens, { amount, price }, dispatch)
  setAmount(0)
  setPrice(0)
}

const sellHandler = (e) => {
  e.preventDefault()
  makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
  setAmount(0)
  setPrice(0)
}

const tabHandler = (e) => {
    if(e.target.className === buyRef.current.className){
      buyRef.current.className = 'tab tab--active'
      sellRef.current.className = 'tab'
      setIsBuy(true)
    }else{
      buyRef.current.className = 'tab'
      sellRef.current.className = 'tab tab--active'
      setIsBuy(false)
    }
  }

  return (
    <div className="component exchange__orders">
      <div className='component__header flex-between'>
        <h2>New Order</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
          <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        
        {isBuy ? (
          <label htmlFor="amount">Buy Amount</label>
          ) : (
          <label htmlFor="amount">Sell Amount</label>
        )}

        <input 
          type='text'
          id='amount'
          placeholder='0.0000'
          value={amount === 0 ? '' : amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {isBuy ? (
          <label htmlFor="price">Buy Price</label>
          ) : (
          <label htmlFor="price">Sell Price</label>
        )}

        <input 
          type='text'
          id='price'
          placeholder='0.0000'
          value={price === 0 ? '' : price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button className='button button--filled' type='submit'>
          {isBuy? (
            <span>Place Buy Order</span>
            ) : (
            <span>Place Sell Order</span>
            )}
        </button>
      </form>
    </div>
  );
}

export default Order;