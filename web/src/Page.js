import './Page.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import { Link } from 'react-router-dom'
import {Helmet} from 'react-helmet'

import { pollCompletion } from './utils'
import { useEthContext, useBiddingPhase, useLocalBidState } from './hooks'
import ls, { refreshBidState } from './localStorage'







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

      <BiddingForm id={id} />

    </div>
  )
}





function BiddingForm({ id }) {
  const {contracts, signer, connectedAddress } = useEthContext()

  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { bids, addBid, updateBidState } = useLocalBidState()

  const onBid = async () => {
    const hashedBid = await contracts.BlindAuction.hashBid(id, ethers.utils.parseEther(bidAmount), connectedAddress)

    setIsLoading(true)

    await contracts.BlindAuction.connect(signer).placeSealedBid(hashedBid, { value: ethers.utils.parseEther('0.2') })

    addBid({
      hashedBid,
      tokenId: id,
      bid: bidAmount,
      bidder: connectedAddress,
      state: 'submitted'
    })


    const nonNullBidder = bid => bid.bidder !== '0x0000000000000000000000000000000000000000'
    await pollCompletion(
      () => contracts.BlindAuction.hashToSealedBids(hashedBid).then(nonNullBidder),
      1000
    )

    updateBidState(hashedBid, 'sealed')
    setIsLoading(false)
  }


  return (
    <section>
      <h2>Place Blind Bid</h2>
      <p>This will require a 0.2 ETH stake</p>
      <div>
        <input value={bidAmount} placeholder="0.2 E" onChange={e => setBidAmount(e.target.value)} type="number" />
        <button onClick={onBid}>
          Place Bid
        </button>
      </div>
      <a href="/">Learn more about the bidding process</a>
      {isLoading ? 'bid pending...' : ''}
      {Object.values(bids)
        .filter(bid => bid.tokenId === id)
        .map((bid, i) => <BidRow bid={bid} key={i} />)
      }
    </section>
  )
}

function BidRow({ bid }) {
  const {contracts, signer, connectedAddress } = useEthContext()
  const biddingPhase = useBiddingPhase()

  const onWithdraw = async () => {

  }

  return (
    <div>
      {bid.bid}
      {bid.state}
      {biddingPhase === '1' ? <button>Widthdraw Bid</button> : false}
      {biddingPhase === '2' ? <button>Reveal Bid</button> : false}

    </div>
  )
}