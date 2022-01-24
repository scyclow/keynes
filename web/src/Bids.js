import './Bids.css'
import { useEthContext, useBiddingPhase, useBids, useHighestBidder } from './hooks'

export default function Bids() {
  const { bids, isLoading, submitBid, withdrawBid, revealBid, claimToken } = useBids()

  return (
    <div>
      {Object.values(bids)
        .map((bid, i) =>
          <BidRow
            bid={bid}
            withdrawBid={() => withdrawBid(bid.hashedBid)}
            revealBid={() => revealBid(bid.hashedBid, bid.tokenId, bid.bid)}
            claimToken={() => claimToken(bid.tokenId)}
            key={i}
          />
        )
      }
    </div>
  )
}


function BidRow({ bid, withdrawBid, revealBid, claimToken }) {
  const {contracts, signer, connectedAddress } = useEthContext()
  const biddingPhase = useBiddingPhase()
  const highestBidder = useHighestBidder(bid.tokenId)


  return (
    <div>
      {bid.tokenId + ' -- '}
      {bid.bid + ' -- '}
      {bid.state + ' -- '}
      {biddingPhase === 1 ? <button onClick={withdrawBid}>Widthdraw Bid</button> : false}
      {biddingPhase === 2 ? <button onClick={revealBid}>Reveal Bid</button> : false}
      {biddingPhase === 3 && highestBidder.bidder === connectedAddress ? <button onClick={revealBid}>Claim</button> : false}
    </div>
  )
}