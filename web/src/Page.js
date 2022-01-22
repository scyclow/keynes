import './Page.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import { Link } from 'react-router-dom'
import {Helmet} from 'react-helmet'

import { pollCompletion } from './utils'
import { useEthContext, useBiddingPhase, useBids, useHighestBidder, useTokenExists } from './hooks'
import ls, { refreshBidState } from './localStorage'







export default function Page() {
  const { id } = useParams()
  const {contracts, connectedAddress } = useEthContext()
  const tokenExists = useTokenExists(id)



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

      {tokenExists
        ? ''
        : connectedAddress
          ? <BiddingForm id={id} />
          : <h2>Please Connect your wallet to bid</h2>
      }

    </div>
  )
}





function BiddingForm({ id }) {
  const {contracts, signer, connectedAddress } = useEthContext()

  const [bidAmount, setBidAmount] = useState('')
  const { bids, isLoading, submitBid, withdrawBid, revealBid } = useBids()
  const biddingPhase = useBiddingPhase()
  const highestBidder = useHighestBidder(id)

  return (
    <section>
      <h2>Place Blind Bid</h2>
      <p>This will require a 0.2 ETH stake</p>
      <div>
        <input value={bidAmount} placeholder="0.2 E" onChange={e => setBidAmount(e.target.value)} type="number" />
        <button onClick={() => submitBid(id, bidAmount)}>
          Place Bid
        </button>
      </div>
      {biddingPhase == 2
        ? `Highest Active Bid: ${highestBidder.amount}`
        : ''
      }

      {biddingPhase == 3
        ? `Winning Bid: ${highestBidder.amount}`
        : ''
      }
      <a href="/">Learn more about the bidding process</a>
      {isLoading ? 'bid pending...' : ''}
      {Object.values(bids)
        .filter(bid => bid.tokenId === id)
        .map((bid, i) =>
          <BidRow
            bid={bid}
            withdrawBid={() => withdrawBid(bid.hashedBid)}
            revealBid={() => revealBid(bid.hashedBid, bid.tokenId, bid.bid)}
            key={i}
          />)
      }
    </section>
  )
}

function BidRow({ bid, withdrawBid, revealBid }) {
  const {contracts, signer, connectedAddress } = useEthContext()
  const biddingPhase = useBiddingPhase()

  return (
    <div>
      {bid.bid}
      {bid.state}
      {biddingPhase === 1 && bid.state === 'sealed' ? <button onClick={withdrawBid}>Widthdraw Bid</button> : false}
      {biddingPhase === 2 && bid.state === 'sealed' ? <button onClick={revealBid}>Reveal Bid</button> : false}

    </div>
  )
}