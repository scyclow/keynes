import { useContext, useState, useEffect } from 'react'
import { EthContext } from './config'
import ls, { refreshBidState } from './localStorage'


export const useEthContext = () => useContext(EthContext)


const BiddingPhases = {
  0: 'Paused',
  1: 'Bidding',
  2: 'Reveal',
  3: 'Claim',
}

export function useBiddingPhase() {
  const [biddingPhase, setBiddingPhase] = useState(null)
  const { contracts, loading } = useEthContext()


  useEffect(async () => {
    if (!loading) {
      const phase = await contracts.BlindAuction.auctionPhase()
      setBiddingPhase(phase.toString())
    }
  }, [loading])

  return biddingPhase
}

export function useLocalBidState() {
  const { contracts, signer, connectedAddress } = useEthContext()
  const [outstandingBids, setOutstandingBids] = useState({})

  useEffect(async () => {
    if (contracts && connectedAddress) {
      await refreshBidState(contracts, connectedAddress)
      setOutstandingBids(ls.getBids(connectedAddress))
    }
  }, [connectedAddress, contracts])

  const addBid = bidInfo => {
    ls.storeBid(bidInfo)
    setOutstandingBids(ls.getBids(connectedAddress))
  }

  const updateBidState = (bidHash, bidState) => {
    ls.updateBidState(connectedAddress, bidHash, bidState)
    setOutstandingBids(ls.getBids(connectedAddress))
  }

  return {
    bids: outstandingBids,
    addBid,
    updateBidState,
  }
}