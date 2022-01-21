import { useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { EthContext } from './config'
import ls, { refreshBidState } from './localStorage'
import { pollCompletion } from './utils'



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

  return Number(biddingPhase)
}


export function useBids() {
  const {contracts, signer, connectedAddress } = useEthContext()
  const [outstandingBids, setOutstandingBids] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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


  const submitBid = async (tokenId, bidAmount) => {
    const hashedBid = await contracts.BlindAuction.hashBid(tokenId, ethers.utils.parseEther(bidAmount), connectedAddress)

    setIsLoading(true)

    await contracts.BlindAuction.connect(signer).placeSealedBid(hashedBid, { value: ethers.utils.parseEther('0.2') })

    addBid({
      hashedBid,
      tokenId,
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

  const withdrawBid = async (hashedBid) => {
    setIsLoading(true)
    await contracts.BlindAuction.connect(signer).withdrawSealedBid(hashedBid)
    const nullBidder = bid => bid.bidder === '0x0000000000000000000000000000000000000000'
    await pollCompletion(
      () => contracts.BlindAuction.hashToSealedBids(hashedBid).then(nullBidder),
      1000
    )
    updateBidState(hashedBid, 'withdrawn')
    setIsLoading(false)
  }

  return {
    bids: outstandingBids,
    isLoading,
    submitBid,
    withdrawBid,
  }
}