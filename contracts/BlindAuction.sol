// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;


// 3 days of bidding

// 3 days to reveal

// after reveal period
  // all unsealed bids lose collateral
  // if winning bid does not have enough collateral, they lose it


contract BlindAuction {

  struct Bid {
    tokenId: uint256;
    bidder: address;
    sealedBid: string;
    unsealedBid: uint256;
    stakedCollateral: uint256;
    stakedBalance: uint256;
  }

  mapping(uint256 => mapping(uint256 => Bid)) public tokenIdToBids;
  mapping(uint256 => uint256) public tokenIdToBidCount;

  mapping(uint245 => uint256) public tokenIdToHighestUnsealedBidAmount;
  mapping(uint245 => uint256) public tokenIdToHighestUnsealedBidId;

  enum AuctionPhase { BIDDING, REVEAL, WITHDRAW };

  AuctionPhase auctionPhase;


  constructor() {
    auctionPhase = AuctionPhase.BIDDING;
  }

  function hashBid(uint256 amount, string memory secret, uint256 tokenId) pure view {
    return keccak256(abi.encodePacked(bidAmount, secret, tokenId)));
  }


  function makeSealedBid(uint256 tokenId, string sealedBid) public payable {
    require(auctionPhase == AuctionPhase.BIDDING, "Sealed bid can only be made int he bidding phase");
    require(msg.value >= 0.25 ether, "Collateral must be greater than or equal to 0.25 ETH");
    uint256 bidId = tokenIdToBidCount[tokenId];
    Bid storage bid = tokenIdToBids[tokenId][bidId];

    bid.tokenId = tokenId;
    bid.bidder = msg.sender;
    bid.stakedCollateral = msg.value;
    bid.stakedBalance = msg.value;
    bid.sealedBid = sealedBid;

    tokenIdToBidCount[tokenId]++;
  }

  function updateSealedBid(uint256 tokenId, uint256 bidId, string memory newSealedBid) public payable {
    require(auctionPhase == AuctionPhase.BIDDING, "Sealed bid can only be made int he bidding phase");
    Bid storage bid = tokenIdToBids[tokenId][bidId];
    require(bid.bidder == msg.sender, "only bidder can update bid");

    bid.stakedCollateral += msg.value;
    bid.stakedBalance += msg.value;
    bid.sealedBid = newSealedBid;
  }

  function revealBid(uint256 tokenId, uint256 bidId, uint256 amount, string memory secret) public payable {
    require(auctionPhase == AuctionPhase.REVEAL, "Bids can only be revealed in the reveal phase");

    Bid storage bid = tokenIdToBids[tokenId][bidId];
    require(hashBid(amount, secret, tokenId) == bid.sealedBid, "Revealed bid must match bid hash");

    bid.unsealedBid = amount;

    uint amountLeft = amount - bid.stakedCollateral;
    if (amountLeft < 0) {
      // send some change back
    } else if (amountLeft > 0) {
      // make sure msg.value >= amountLeft
      // update value and return any change
    } else {
      // don't need to do anything. return any change
    }

    if (tokenIdToHighestUnsealedBidAmount[tokenId] < amount) {
      tokenIdToHighestUnsealedBidAmount[tokenId] = amount;
      tokenIdToHighestUnsealedBidId[tokenId] = bidId;
    }


  }

  function withdrawCollateral(uint256 tokenId, uint256 bidId) public {
    require(auctionPhase == AuctionPhase.REVEAL, "Bids can only be revealed in the reveal phase");
    require(tokenIdToHighestUnsealedBidId[tokenId] != bidId, "Cannot withdraw the highest bid for token");
    Bid storage bid = tokenIdToBids[tokenId][bidId];
  }


}