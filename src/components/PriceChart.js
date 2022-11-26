import downArrow from '../assets/down-arrow.svg'
import { useSelector } from 'react-redux'
import Banner from './Banner.js'
import Chart from 'react-apexcharts'
import { options, series } from './PriceChart.config'
import { priceChartSelector } from '../store/selectors'

const PriceChart = () => {

  const account = useSelector(state => state.provider.account)
  const symbols = useSelector(state => state.tokens.symbols)
  const priceChart = useSelector(priceChartSelector)

  return (
    <div className="component exchange__chart">
      <div className='component__header flex-between'>
        <div className='flex'>

          <h2>{symbols && `${symbols[0]} / ${symbols[1]}`}</h2>

          <div className='flex'>

            <img src={downArrow} alt="Arrow down" />
            <span className='up'></span>
          </div>

        </div>
      </div>

      {/* Price chart goes here */}
      {!account ? (
        <Banner text={'Pease Connect Your Metamask'} />
        ) : (
        <Chart
        type="candlestick"
        options={options}
        series={series}
        width="100%"
        height="100%"
        />
        )}

    </div>
  );
}

export default PriceChart;
