import logo from '../assets/BigRLogo.png'
import { useSelector } from 'react-redux'
import Blockies from 'react-blockies'

const Navbar = () => {
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.provider.balance)


  return(
    <div className='exchange__header grid'>
      <div className='exchange__header--brand flex'>
      <img src={logo} alt="Exchange Logo" width='150px' className='logo'></img>
      	<h1>RasmussenSwap </h1>
      </div>

      <div className='exchange__header--networks flex'>

      </div>

      <div className='exchange__header--account flex'>
      {balance ? (<p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
      	) : (
      	<p>0 ETH</p>
      )}

      
      {account ? (
      		<a href="">{account.slice(0,5) + '...' + account.slice(38, 42)}
      	<Blockies
      		account={account}
      		className='identicon'
      	/>
      	</a>

      	) : (
      	<a href=""></a>
      	)}
       
      
     
      </div>
    </div>
  )
}

export default Navbar;
