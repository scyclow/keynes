
/*
{
  hashedBid,
  tokenId
  bid
  bidder
  state
}
*/

const BID_INFO = '__bid_info__'

function storeBid(bidInfo) {
  const { bidder, hashedBid } = bidInfo
  const storedBidInfo = JSON.parse(localStorage.getItem(BID_INFO)) || {}
  const bidderInfo = storedBidInfo[bidder] || {}
  bidderInfo[hashedBid] = bidInfo
  storedBidInfo[bidder] = bidderInfo
  localStorage.setItem(BID_INFO, JSON.stringify(storedBidInfo))
}

function updateBidState(bidder, hashedBid, state) {
  const storedBidInfo = JSON.parse(localStorage.getItem(BID_INFO)) || {}
  const bid = storedBidInfo?.[bidder]?.[hashedBid] || { hashedBid, bidder }
  bid.state = state
  localStorage.setItem(BID_INFO, JSON.stringify(storedBidInfo))
}

function getBids(bidder) {
  const storedBidInfo = JSON.parse(localStorage.getItem(BID_INFO)) || {}
  return storedBidInfo[bidder] || {}
}

export default {
  storeBid,
  updateBidState,
  getBids,
}


window.__clearLocalStorage = () => localStorage.removeItem(BID_INFO)


export async function refreshBidState(contracts, bidder) {
  const createLogs = await contracts.BlindAuction.filters.CreateBid(null, null, bidder)
  const createBids = await contracts.BlindAuction.queryFilter(createLogs)

  const withdrawLogs = await contracts.BlindAuction.filters.WithdrawBid(null, bidder)
  const withdrawBids = await contracts.BlindAuction.queryFilter(withdrawLogs)

  const revealLogs = await contracts.BlindAuction.filters.RevealBid(null, null, bidder)
  const revealBids = await contracts.BlindAuction.queryFilter(revealLogs)


  createBids.forEach(bid => updateBidState(bidder, bid.args.hash, 'sealed'))
  withdrawBids.forEach(bid => updateBidState(bidder, bid.args.hash, 'withdrawn'))
  revealBids.forEach(bid => updateBidState(bidder, bid.args.hash, 'revealed'))
  console.log(revealBids)
}