// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;


interface IKeynesianBeautyContest {
  function mint(address to, uint256 tokenId) external;
  function owner() external view returns (address);
  function exists(uint256 tokenId) external view returns (bool);
}


contract BlindAuction {
  struct SealedBid {
    address bidder;
    uint256 stake;
  }

  struct UnsealedBid {
    address bidder;
    uint256 amount;
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

  modifier onlyOwner() {
    require(msg.sender == kbcContract.owner(), "Ownable: caller is not the owner");
    _;
  }


  function hashBid(uint256 tokenId, uint256 amount, address bidder) public pure returns (bytes32) {
    require(amount > 0, "Bid amount must be positive");
    return keccak256(abi.encodePacked(tokenId, amount, bidder));
  }

  function placeSealedBid(bytes32 bidHash) public payable {
    require(msg.value >= minimumCollateral, "Collateral not high enough");
    require(auctionPhase == AuctionPhase.BIDDING, "Bid can only be created in the BIDDING phase");

    _createNewSealedBid(bidHash, msg.value, msg.sender);
  }

  function withdrawSealedBid(bytes32 bidHash) external nonReentrant {
    require(auctionPhase == AuctionPhase.BIDDING, "Bid can only be withdrawn or updated in the BIDDING phase");

    uint256 stake = hashToSealedBids[bidHash].stake;
    _deleteSealedBid(bidHash);
    payable(msg.sender).transfer(stake);
  }

  function updateSealedBid(bytes32 oldBidHash, bytes32 newBidHash) external {
    require(auctionPhase == AuctionPhase.BIDDING, "Bid can only be withdrawn or updated in the BIDDING phase");

    _createNewSealedBid(newBidHash, hashToSealedBids[oldBidHash].stake, msg.sender);
    _deleteSealedBid(oldBidHash);
  }

  function _deleteSealedBid(bytes32 bidHash) private {
    require(hashToSealedBids[bidHash].bidder != address(0), "Bid does not exist");
    require(msg.sender == hashToSealedBids[bidHash].bidder, "Bid can only be withdrawn by the bidder");

    delete hashToSealedBids[bidHash];
  }

  function _createNewSealedBid(bytes32 bidHash, uint256 stake, address bidder) private {
    require(hashToSealedBids[bidHash].bidder == address(0), 'Hash for sealed bid already exists');

    hashToSealedBids[bidHash].bidder = bidder;
    hashToSealedBids[bidHash].stake = stake;
  }

  function unsealBid(uint256 tokenId, uint256 amount) external payable nonReentrant {
    require(auctionPhase == AuctionPhase.REVEAL, "Bids can only be unsealed in the REVEAL phase");

    bytes32 bidHash = hashBid(tokenId, amount, msg.sender);
    SealedBid memory sealedBid = hashToSealedBids[bidHash];

    require(sealedBid.bidder != address(0), "Bid must be active to be unsealed");
    require(sealedBid.stake > 0, "Stake must be positive to unseal");
    _deleteSealedBid(bidHash);

    UnsealedBid storage highestUnsealedBid = tokenIdToHighestUnsealedBid[tokenId];

    if (amount > highestUnsealedBid.amount && tokenId < 100 && !kbcContract.exists(tokenId)) {
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
    require(!kbcContract.exists(tokenId), "Token has already been claimed");

    kbcContract.mint(unsealedBid.bidder, tokenId);
  }

  function withdrawBids() external onlyOwner {
    require(auctionPhase == AuctionPhase.CLAIM, "Funds can only be withdrawn in the CLAIM phase");
    payable(msg.sender).transfer(address(this).balance);
  }

  function changeAuctionPhaseBidding() external onlyOwner { auctionPhase = AuctionPhase.BIDDING; }
  function changeAuctionPhasePaused() external onlyOwner { auctionPhase = AuctionPhase.PAUSED; }
  function changeAuctionPhaseReveal() external onlyOwner { auctionPhase = AuctionPhase.REVEAL; }
  function changeAuctionPhaseClaim() external onlyOwner { auctionPhase = AuctionPhase.CLAIM; }
}
