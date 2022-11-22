import dapp from '../assets/dapp.svg'
import eth from '../assets/eth.svg'
import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  loadBalances,
  transferTokens,
} from '../store/interactions'

const Balance = () => {

  const [token1TA, setToken1TA ] = useState(0)
  const [token2TA, setToken2TA ] = useState(0)
  const [isDeposit, setIsDeposit] = useState(true)
  

  const dispatch = useDispatch()
  const provider = useSelector(state => state.provider.connection)
  const symbols = useSelector(state => state.tokens.symbols)
  const exchange = useSelector(state => state.exchange.contract)
  const exchangeBalances = useSelector(state => state.exchange.balances)
  const transferInProgress = useSelector(state => state.exchange.transferInProgress)
  const tokens = useSelector(state => state.tokens.contracts)
  const account = useSelector(state => state.provider.account)
  const tokenBalances = useSelector(state => state.tokens.balances)

  const amountHandler = (e, token) => {
    if(token.address === tokens[0].address){
      setToken1TA(e.target.value)
    } else {
      setToken2TA(e.target.value)
    }
    console.log(token2TA)
  }

  const depositRef = useRef(null)

  const withdrawRef = useRef(null)

  const tabHandler = (e) => {
    if(e.target.className === depositRef.current.className){
      depositRef.current.className = 'tab tab--active'
      withdrawRef.current.className = 'tab'
      setIsDeposit(true)
    }else{
      depositRef.current.className = 'tab'
      withdrawRef.current.className = 'tab tab--active'
      setIsDeposit(false)
    }
  }

  const depositHandler = (e, token) => {
    e.preventDefault()
    if(token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Deposit', token, token1TA, dispatch)
      setToken1TA(0)
    } else {
      transferTokens(provider, exchange, 'Deposit', token, token2TA, dispatch)
      setToken2TA(0)
    }
  }

  const withdrawalHandler = (e, token) => {
    e.preventDefault()
    if(token.address === tokens[0].address) {
      console.log('token1TA', token1TA)
      transferTokens(provider, exchange, 'Withdraw', token, token1TA, dispatch)
      setToken1TA(0)
    } else {
      transferTokens(provider, exchange, 'Withdraw', token, token2TA, dispatch)
      setToken2TA(0)
    }

  }

  useEffect(() => {
    if(exchange && account && tokens[0] && tokens[1]){
      loadBalances(exchange, tokens, account, dispatch)  
    }
  }, [exchange, tokens, account, transferInProgress])

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balances</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo"/>{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br/>{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br/>{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawalHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input 
            type="text"
            id='token0'
            placeholder='0.0000'
            value={token1TA === 0 ? '' : token1TA}
            onChange={(e) => amountHandler(e, tokens[0])}
          />

          <button className='button' type='submit'>
            {isDeposit ? (
              <span>Deposit Tokens</span>
              ) : (
              <span>Withdraw Tokens</span>
              )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo"/>{symbols && symbols[1]}</p>
          <p><small>Wallet</small><br/>{tokenBalances && tokenBalances[1]}</p>
          <p><small>Exchange</small><br/>{exchangeBalances && exchangeBalances[1]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawalHandler(e, tokens[1])}>
          <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
          <input 
            type="text"
            id='token1'
            placeholder='0.0000'
            value={token2TA === 0 ? '' : token2TA}
            onChange={(e) => amountHandler(e, tokens[1])}
          />

          <button className='button' type='submit'>
            {isDeposit ? (
              <span>Deposit Tokens</span>
              ) : (
              <span>Withdraw Tokens</span>
              )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;