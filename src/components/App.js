
import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import Navbar from './Navbar.js'
import Markets from './Markets.js'
import Balance from './Balance.js'

import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents
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

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
