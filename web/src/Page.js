import './Page.css'
import { useParams } from 'react-router-dom'
import tokenData from './data'

import { Link } from 'react-router-dom'
import {Helmet} from 'react-helmet'

import { prettyNumber, fmt, useCountdown } from './utils'






export default function Page() {
  const { id } = useParams()


  return (
    <div className="Page">


      <header >
        <Link to="/"><h2>{'< Back'}</h2></Link>
        <h2 style={{ margin: 'initial'}}>{`Keynesian Beauty Contest`}</h2>
      </header>

      <section className="pageSection">
        <div className="photo">
          <a href={`../assets/${id}.jpeg`} target="_blank">
            <img src={`../assets/${id}.jpeg`} />
          </a>
        </div>
      </section>

    </div>
  )
}





const combineData = (localData={}, apiData={}) => {
  const auction = apiData?.auctions?.[0] || {}
  const currentBid = prettyNumber(auction.lastBidAmount)
  const reservePrice = prettyNumber(auction.reservePrice)

  return {
    ...localData,
    reservePrice,
    currentBid,
    endTime: auction.expiresAt && new Date(auction.expiresAt).getTime(),
    status: auction.status
  }
}