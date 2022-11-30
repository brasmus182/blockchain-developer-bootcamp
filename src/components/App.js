import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import Navbar from './Navbar.js'
import Markets from './Markets.js'
import Balance from './Balance.js'
import Order from './Order.js'
import OrderBook from './OrderBook.js'
import PriceChart from './PriceChart.js'
import Trades from './Trades.js'
import Transactions from './Transactions.js'

import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders
} from '../store/interactions';


 
function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    
    const provider = loadProvider(dispatch);

    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    const chainId = await loadNetwork(provider, dispatch)

    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    const exchangeConfig = config[chainId].exchange 
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    subscribeToEvents(exchange, dispatch)
    loadAllOrders(provider, exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData();
  })

  return (
    <div>
   
      {/* Navbar */}
      <Navbar/>
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}
          <Markets/>

          {/* Balance */}
          <Balance />
          {/* Order */}
          <Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}
        <PriceChart />

          {/* Transactions */}
        <Transactions />

          {/* Trades */}
          <Trades />

          <OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
