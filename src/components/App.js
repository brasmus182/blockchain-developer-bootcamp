
import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import Navbar from './Navbar.js'
import Markets from './Markets.js'

import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
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

    const exchange = config[chainId].exchange 
    await loadExchange(provider, exchange.address, dispatch)

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
