import { useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { EthContext } from './config'
import ls, { refreshBidState } from './localStorage'
import { pollCompletion } from './utils'


const nullAddr = '0x0000000000000000000000000000000000000000'

export const useEthContext = () => useContext(EthContext)


const BiddingPhases = {
  0: 'Paused',
  1: 'Bidding',
  2: 'Reveal',
  3: 'Claim',
}

export function useBiddingPhase() {
  const [biddingPhase, setBiddingPhase] = useState(0)
  const { contracts, loading } = useEthContext()


  useEffect(async () => {
    if (!loading) {
      const refresh = async () => {
        const phase = await contracts.BlindAuction.auctionPhase()
        setBiddingPhase(Number(phase.toString()))
        setTimeout(refresh, 3000)
      }
      refresh()

    }
  }, [loading])

  return biddingPhase
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


    const nonNullBidder = bid => bid.bidder !== nullAddr
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
    const nullBidder = bid => bid.bidder === nullAddr
    await pollCompletion(
      () => contracts.BlindAuction.hashToSealedBids(hashedBid).then(nullBidder),
      1000
    )
    updateBidState(hashedBid, 'withdrawn')
    setIsLoading(false)
  }

  const revealBid = async (hashedBid, tokenId, bidAmount) => {
    setIsLoading(true)
    const highestBid = await contracts.BlindAuction.tokenIdToHighestUnsealedBid(tokenId)
    const highestBidAmount = Number(ethers.utils.formatEther(highestBid.amount))

    const amountToIncreaseBid = outstandingBids[hashedBid].bid > highestBidAmount
      ? Math.max(Number(outstandingBids[hashedBid].bid - 0.2, 0))
      : 0

    await contracts.BlindAuction.connect(signer).unsealBid(
      tokenId,
      ethers.utils.parseEther(bidAmount),
      { value: ethers.utils.parseEther(String(amountToIncreaseBid)) }
    )

    const nonNullBidder = bid => bid.bidder !== nullAddr
    await pollCompletion(
      () => contracts.BlindAuction.hashToSealedBids(hashedBid).then(nonNullBidder),
      1000
    )
    updateBidState(hashedBid, 'revealed')
    setIsLoading(false)
  }

  // const claim

  return {
    bids: outstandingBids,
    isLoading,
    submitBid,
    withdrawBid,
    revealBid,
  }
}

export function useTokenExists(tokenId) {
  const [isLoading, setIsLoading] = useState(false)
  const { contracts } = useEthContext()
  const [exists, setExists] = useState(false)

  useEffect(async () => {
    if (contracts) {
      const exists = await contracts.KBC.exists(tokenId)
      setExists(exists)
    }
  }, [contracts])

  return exists
}

export function useHighestBidder(tokenId) {
  const [isLoading, setIsLoading] = useState(false)
  const { contracts } = useEthContext()
  const [highestBidder, setHighestBidder] = useState({ bidder: nullAddr, amount: 0 })

  useEffect(async () => {
    if (contracts) {
      const highestBidder = await contracts.BlindAuction.tokenIdToHighestUnsealedBid(tokenId)
      setHighestBidder(highestBidder)
    }
  }, [contracts])

  return {
    bidder: highestBidder.bidder,
    amount: ethers.utils.formatEther(String(highestBidder.amount))
  }
}