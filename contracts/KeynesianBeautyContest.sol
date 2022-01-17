// SPDX-License-Identifier: MIT

import "./Dependencies.sol";

pragma solidity ^0.8.11;

interface ITokenURI {
  function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract KeynesianBeautyContest is ERC721, Ownable {
  ITokenURI public tokenURIContract;

  address public mintingAddress;

  address private _royaltyBenificiary;
  uint16 private _royaltyBasisPoints = 1000;

  event ProjectEvent(address indexed poster, string indexed eventType, string content);
  event TokenEvent(address indexed poster, uint256 indexed tokenId, string indexed eventType, string content);

  constructor() ERC721('KeynesianBeautyContest', 'KBC') {
    mintingAddress = msg.sender;
    _royaltyBenificiary = msg.sender;
  }

  modifier onlyMinter() {
    require(mintingAddress == _msgSender(), 'Caller is not the minting address');
    _;
  }

  function totalSupply() external pure returns (uint256) {
    return 100;
  }

  function exists(uint256 tokenId) external view returns (bool) {
    return _exists(tokenId);
  }

  function mint(address to, uint256 tokenId) external onlyMinter {
    require(tokenId < 100, 'Invalid tokenId');
    _mint(to, tokenId);
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    return tokenURIContract.tokenURI(tokenId);
  }

  function emitTokenEvent(uint256 tokenId, string calldata eventType, string calldata content) external {
    require(
      owner() == _msgSender() || ERC721.ownerOf(tokenId) == _msgSender(),
      'Only project or token owner can emit token event'
    );
    emit TokenEvent(_msgSender(), tokenId, eventType, content);
  }

  function emitProjectEvent(string calldata eventType, string calldata content) external onlyOwner {
    emit ProjectEvent(_msgSender(), eventType, content);
  }

  function setMintingAddress(address minter) external onlyOwner {
    mintingAddress = minter;
  }

  function setTokenURIPointer(address _tokenURIAddress) external onlyOwner {
    tokenURIContract = ITokenURI(_tokenURIAddress);
  }

  function setRoyaltyInfo(
    address royaltyBenificiary,
    uint16 royaltyBasisPoints
  ) external onlyOwner {
    _royaltyBenificiary = royaltyBenificiary;
    _royaltyBasisPoints = royaltyBasisPoints;
  }

  // Royalty Info

  function royaltyInfo(uint256, uint256 _salePrice) external view returns (address, uint256) {
    return (_royaltyBenificiary, _salePrice * _royaltyBasisPoints / 10000);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
    // 0x2a55205a == ERC2981 interface id
    return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
  }
}

