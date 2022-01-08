// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;



interface IKeynesianBeautyContest {
  function mint(address to, uint256 tokenId) external;
}


contract BlindAuction {
  struct SealedBid {
    address bidder;
    uint256 stake;
    bool    active;
  }

  struct UnsealedBid {
    address bidder;
    uint256 amount;
    bool    claimed;
  }

  enum AuctionPhase {
    PAUSED,
    BIDDING,
    REVEAL,
    CLAIM
  }

  mapping(bytes32 => SealedBid) public hashToSealedBids;
  mapping(uint256 => UnsealedBid) public tokenIdToHighestUnsealedBid;


  bool private locked;
  uint256 public minimumCollateral = 0.2 ether;
  IKeynesianBeautyContest public immutable kbcContract;
  AuctionPhase public auctionPhase = AuctionPhase.PAUSED;

  constructor(address _kbcContractAddr) {
    kbcContract = IKeynesianBeautyContest(_kbcContractAddr);
  }

  modifier nonReentrant() {
    require(!locked, "No re-entrancy");
    locked = true;
    _;
    locked = false;
  }


  function hashBid(uint256 tokenId, uint256 amount, address bidder) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(tokenId, amount, bidder));
  }

  function placeSealedBid(bytes32 bidHash) public payable nonReentrant {
    require(msg.value >= minimumCollateral, "Collateral not high enough");
    _createNewSealedBid(bidHash, msg.value, msg.sender);
  }

  function withdrawSealedBid(bytes32 bidHash) external {

    require(auctionPhase == AuctionPhase.PAUSED || auctionPhase == AuctionPhase.BIDDING, "Bid can only be withdrawn in the PAUSED of BIDDING phase");
    SealedBid memory sealedBid = hashToSealedBids[bidHash];
    require(msg.sender == sealedBid.bidder, "Bid can only be withdrawn by the bidder");
    require(sealedBid.active == true, "Bid must be active for collateral to be unstaked");

    _markSealedBidInnactive(bidHash);
    payable(msg.sender).transfer(sealedBid.stake);
  }

  function updateSealedBid(bytes32 oldBidHash, bytes32 newBidHash) external {
    SealedBid memory oldBid = hashToSealedBids[oldBidHash];
    require(auctionPhase == AuctionPhase.PAUSED || auctionPhase == AuctionPhase.BIDDING, "Bid can only be withdrawn in the PAUSED of BIDDING phase");
    require(msg.sender == oldBid.bidder, "Bid can only be withdrawn by the bidder");

    uint256 stake = hashToSealedBids[oldBidHash].stake;
    _markSealedBidInnactive(oldBidHash);
    _createNewSealedBid(newBidHash, stake, msg.sender);
  }

  function _markSealedBidInnactive(bytes32 bidHash) private {
    hashToSealedBids[bidHash].stake = 0;
    hashToSealedBids[bidHash].active = false;
  }

  function _createNewSealedBid(bytes32 bidHash, uint256 stake, address bidder) private {
    hashToSealedBids[bidHash].bidder = bidder;
    hashToSealedBids[bidHash].stake = stake;
    hashToSealedBids[bidHash].active = true;
  }

  function unsealBid(uint256 tokenId, uint256 amount) external payable nonReentrant {
    require(auctionPhase == AuctionPhase.REVEAL, "Bids can only be unsealed in the REVEAL phase");

    bytes32 bidHash = hashBid(tokenId, amount, msg.sender);
    SealedBid memory sealedBid = hashToSealedBids[bidHash];
    require(sealedBid.stake > 0, "Stake must be positive to unseal");
    require(sealedBid.active == true, "Bid must be active to be unsealed");
    _markSealedBidInnactive(bidHash);

    UnsealedBid storage highestUnsealedBid = tokenIdToHighestUnsealedBid[tokenId];

    if (amount > highestUnsealedBid.amount && tokenId < 100) {
      // if sender is the highest bider for the token and the token is valid...
      // refund the current highest bidder
      payable(highestUnsealedBid.bidder).transfer(highestUnsealedBid.amount);

      // update highest bidder
      highestUnsealedBid.amount = amount;
      highestUnsealedBid.bidder = msg.sender;

      // update stake amount
      if (amount > sealedBid.stake) {
        // If bidder's existing stake isn't high enough to support bid, require more eth
        require(msg.value >= amount - sealedBid.stake, "Updated stake not enough to support bid");
      } else if (amount < sealedBid.stake) {
        // If bidder's existing stake is higher than bid, return
        payable(msg.sender).transfer(sealedBid.stake - amount);
      }

    } else {
      // otherwise, refund
      payable(msg.sender).transfer(sealedBid.stake + msg.value);
    }
  }

  function claimToken(uint256 tokenId) external {
    require(auctionPhase == AuctionPhase.CLAIM, "Tokens can only be claimed in the CLAIM phase");
    UnsealedBid storage unsealedBid = tokenIdToHighestUnsealedBid[tokenId];
    require(unsealedBid.bidder == msg.sender, "Token can only be claimed by highest bidder for token");
    require(!unsealedBid.claimed, "Token has already been claimed");
    unsealedBid.claimed = true;

    kbcContract.mint(unsealedBid.bidder, tokenId);
  }
}
