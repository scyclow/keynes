// SPDX-License-Identifier: MIT

import "./Dependencies.sol";

pragma solidity ^0.8.11;

interface ITokenURI {
  function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract KeynesianBeautyContest is ERC721, Ownable {
  using Strings for uint256;

  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

  address public mintingAddress;
  uint256 constant public maxTokenCount = 100;

  bool public useURIProxy;
  ITokenURI public externalTokenURIContract;

  string public baseUrl;
  string public metadataExtension;

  string public baseImgUrl;
  string public baseExternalUrl;
  string public license = 'CC BY-NC 4.0';
  string public imgExtension = '.jpeg';

  address public royaltyBenificiary;
  uint16 public royaltyBasisPoints = 1000;

  mapping(address => bool) public operatorDenials;
  mapping (uint256 => string) public tokenIdToName;
  mapping (uint256 => string) public tokenIdToDescription;

  event ProjectEvent(address indexed poster, string indexed eventType, string content);
  event TokenEvent(address indexed poster, uint256 indexed tokenId, string indexed eventType, string content);

  constructor() ERC721('KeynesianBeautyContest', 'KBC') {
    mintingAddress = msg.sender;
    royaltyBenificiary = msg.sender;
  }

  modifier onlyMinter() {
    require(mintingAddress == _msgSender(), 'Caller is not the minting address');
    _;
  }

  function totalSupply() external pure returns (uint256) {
    return maxTokenCount;
  }

  function mint(address to, uint256 tokenId) external onlyMinter {
    require(tokenId < maxTokenCount, 'Invalid tokenId');
    _mint(to, tokenId);
  }

  function setMintingAddress(address minter) external onlyOwner {
    mintingAddress = minter;
  }


  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');

    if (useURIProxy) {
      return externalTokenURIContract.tokenURI(tokenId);
    }

    string memory tokenString = tokenId.toString();

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

  function setUseURIPointer(bool _useURIProxy, address _externalTokenURIAddress) external onlyOwner {
    useURIProxy = _useURIProxy;
    externalTokenURIContract = ITokenURI(_externalTokenURIAddress);
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
    uint256 tokenId,
    string calldata name,
    string calldata description
  ) external onlyOwner {
    tokenIdToName[tokenId] = name;
    tokenIdToDescription[tokenId] = description;
  }

  function batchSetTokenMetadata(
    uint256[] calldata tokenIds,
    string[] calldata names,
    string[] calldata descriptions
  ) external onlyOwner {
    require(tokenIds.length == descriptions.length);
    require(tokenIds.length == names.length);

    for (uint i = 0; i < tokenIds.length; i++) {
      uint256 tokenId = tokenIds[i];
      tokenIdToName[tokenId] = names[i];
      tokenIdToDescription[tokenId] = descriptions[i];
    }
  }


  function emitProjectEvent(string calldata _eventType, string calldata _content) external onlyOwner {
    emit ProjectEvent(_msgSender(), _eventType, _content);
  }

  function emitTokenEvent(uint256 tokenId, string calldata _eventType, string calldata _content) external {
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



