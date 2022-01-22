import './Dev.css'
import { useEthContext, useBiddingPhase, useBids } from './hooks'

const BiddingPhases = {
  0: 'Paused',
  1: 'Bidding',
  2: 'Reveal',
  3: 'Claim',
}

export default function Dev() {
  // const { Dev, addBid, updateBidState } = useLocalBidState()

  const {
    provider,
    contracts,
    signer,
    connectedAddress,
    connected,
    onConnect,
    onDisconnect,
    loading
  } = useEthContext()
  const biddingPhase = useBiddingPhase()

  const setBidding = () => contracts.BlindAuction.connect(signer).changeAuctionPhaseBidding()
  const setPaused = () => contracts.BlindAuction.connect(signer).changeAuctionPhasePaused()
  const setReveal = () => contracts.BlindAuction.connect(signer).changeAuctionPhaseReveal()
  const setClaim = () => contracts.BlindAuction.connect(signer).changeAuctionPhaseClaim()


  return (
    <div>
      Current Phase: {BiddingPhases[biddingPhase]}
      <button onClick={setBidding}>Move to Bidding</button>
      <button onClick={setPaused}>Move to Paused</button>
      <button onClick={setReveal}>Move to Reveal</button>
      <button onClick={setClaim}>Move to Claim</button>
    </div>
  )
}


