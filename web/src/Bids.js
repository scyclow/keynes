import './Bids.css'
import { useEthContext, useBiddingPhase, useBids } from './hooks'

export default function Bids() {
  // const { bids, addBid, updateBidState } = useLocalBidState()
  const { bids, isLoading, submitBid, withdrawBid } = useBids()


  return (
    <div>
      {Object.values(bids)
        .map((bid, i) =>
          <BidRow
            bid={bid}
            withdrawBid={() => withdrawBid(bid.hashedBid)}
            key={i}
          />
        )
      }
    </div>
  )
}


function BidRow({ bid, withdrawBid }) {
  const {contracts, signer, connectedAddress } = useEthContext()
  const biddingPhase = useBiddingPhase()


  return (
    <div>
      {bid.tokenId + ' -- '}
      {bid.bid + ' -- '}
      {bid.state + ' -- '}
      {biddingPhase === 1 ? <button onClick={withdrawBid}>Widthdraw Bid</button> : false}
      {biddingPhase === 2 ? <button>Reveal Bid</button> : false}

    </div>
  )
}