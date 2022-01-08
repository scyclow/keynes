// SPDX-License-Identifier: MIT

import "./Dependencies.sol";

pragma solidity ^0.8.11;


contract KeynesianBeautyContest is ERC721, Ownable {
  using Strings for uint8;

  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

  address public mintingAddress;
  uint8 constant public maxTokenCount = 100;

  bool public useURIPointer;

  string public baseUrl;
  string public metadataExtension;

  string public baseImgUrl;
  string public baseExternalUrl;
  string public license = 'CC BY-NC 4.0';
  string public imgExtension = '.jpeg';

  address public royaltyBenificiary;
  uint16 public royaltyBasisPoints = 1000;

  mapping(address => bool) public operatorDenials;
  mapping (uint8 => string) public tokenIdToName;
  mapping (uint8 => string) public tokenIdToDescription;

  event ProjectEvent(address indexed poster, string indexed eventType, string content);
  event TokenEvent(address indexed poster, uint8 indexed tokenId, string indexed eventType, string content);

  constructor() ERC721('KeynesianBeautyContest', 'KBC') {
    mintingAddress = msg.sender;
    royaltyBenificiary = msg.sender;
  }

  modifier onlyMinter() {
    require(mintingAddress == _msgSender(), 'Caller is not the minting address');
    _;
  }

  function totalSupply() external pure returns (uint8) {
    return maxTokenCount;
  }

  function mint(address to, uint8 tokenId) external onlyMinter {
    require(tokenId < maxTokenCount, 'Invalid tokenId');
    _mint(to, tokenId);
  }

  function setMintingAddress(address minter) external onlyOwner {
    mintingAddress = minter;
  }


  function tokenURI(uint8 tokenId) public view returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');

    string memory tokenString = tokenId.toString();

    if (useURIPointer) {
      return string(abi.encodePacked(baseUrl, tokenString, metadataExtension));
    }

    string memory json = Base64.encode(
      bytes(
        abi.encodePacked(
          '{"name": "', tokenIdToName[tokenId],
          '", "description": "', tokenIdToDescription[tokenId],
          '", "license": "', license,
          '", "image": "', baseImgUrl, tokenString, imgExtension,
          '", "external_url": "', baseExternalUrl, tokenString,
          '", "tokenId": "', tokenString,
          '"}'
        )
      )
    );
    return string(abi.encodePacked('data:application/json;base64,', json));
  }

  function flipUseURIPointer() external onlyOwner {
    useURIPointer = !useURIPointer;
  }

  function updateBaseUrl(string calldata _baseUrl, string calldata _metadataExtension) external onlyOwner {
    baseUrl = _baseUrl;
    metadataExtension = _metadataExtension;
  }


  function setBaseMetadata(
    string calldata _baseImgUrl,
    string calldata _imgExtension,
    string calldata _baseExternalUrl,
    string calldata _license
  ) external onlyOwner {
    baseImgUrl = _baseImgUrl;
    imgExtension = _imgExtension;
    baseExternalUrl = _baseExternalUrl;
    license = _license;
  }


  function setTokenMetadata(
    uint8 tokenId,
    string calldata name,
    string calldata description
  ) external onlyOwner {
    tokenIdToName[tokenId] = name;
    tokenIdToDescription[tokenId] = description;
  }

  function batchSetTokenMetadata(
    uint8[] calldata tokenIds,
    string[] calldata names,
    string[] calldata descriptions
  ) external onlyOwner {
    require(tokenIds.length == descriptions.length);
    require(tokenIds.length == names.length);

    for (uint i = 0; i < tokenIds.length; i++) {
      uint8 tokenId = tokenIds[i];
      tokenIdToName[tokenId] = names[i];
      tokenIdToDescription[tokenId] = descriptions[i];
    }
  }


  function emitProjectEvent(string calldata _eventType, string calldata _content) external onlyOwner {
    emit ProjectEvent(_msgSender(), _eventType, _content);
  }

  function emitTokenEvent(uint8 tokenId, string calldata _eventType, string calldata _content) external {
    require(
      owner() == _msgSender() || ERC721.ownerOf(tokenId) == _msgSender(),
      'Only project or token owner can emit token event'
    );
    emit TokenEvent(_msgSender(), tokenId, _eventType, _content);
  }

  function updatRoyaltyInfo(
    address _royaltyBenificiary,
    uint16 _royaltyBasisPoints
  ) external onlyOwner {
    royaltyBenificiary = _royaltyBenificiary;
    royaltyBasisPoints = _royaltyBasisPoints;
  }

  function royaltyInfo(uint256, uint256 _salePrice) external view returns (address, uint256) {
    return (royaltyBenificiary, _salePrice * royaltyBasisPoints / 10000);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
    return interfaceId == _INTERFACE_ID_ERC2981 || super.supportsInterface(interfaceId);
  }
}



