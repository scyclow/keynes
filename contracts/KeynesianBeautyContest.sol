// SPDX-License-Identifier: MIT

import "./Dependencies.sol";

pragma solidity ^0.8.11;


contract KeynesianBeautyContest is ERC721, ERC721Burnable, Ownable {
  using Strings for uint256;

  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

  uint private _tokenIdCounter;
  address public mintingAddress;

  bool public useURIPointer;

  string public baseUrl;
  string public metadataExtension;

  string public baseImgUrl;
  string public baseExternalUrl;
  string public license;
  string public imgExtension;

  address public royaltyBenificiary;
  uint public royaltyBasisPoints;

  mapping(address => bool) public operatorDenials;
  mapping (uint256 => string) public tokenIdToName;
  mapping (uint256 => string) public tokenIdToAttributtes;
  mapping (uint256 => string) public tokenIdToDescription;

  event ProjectEvent(address indexed poster, string indexed eventType, string content);
  event TokenEvent(address indexed poster, uint256 indexed tokenId, string indexed eventType, string content);

  constructor() ERC721('KeynesianBeautyContest', 'KBC') {
    baseUrl = '';
    baseImgUrl = '';
    baseExternalUrl = '';
    projectDescription = '';

    license = 'CC BY-NC 4.0';
    imgExtension = '.png';
    metadataExtension = '';
    useURIPointer = false;

    mintingAddress = msg.sender;
    royaltyBenificiary = msg.sender;
    royaltyBasisPoints = 750;

    _tokenIdCounter = 0;
  }

  function totalSupply() public view virtual returns (uint256) {
    return _tokenIdCounter;
  }

  function mint(address to, string memory name, string memory attributes, string memory description) public {
    require(mintingAddress == _msgSender(), 'Caller is not the minting address');
    _mint(to, _tokenIdCounter);
    tokenIdToName[_tokenIdCounter] = name;
    tokenIdToAttributes[_tokenIdCounter] = attributes;
    tokenIdToDescription[_tokenIdCounter] = description;
    _tokenIdCounter++;
  }

  function setMintingAddress(address minter) public onlyOwner {
    mintingAddress = minter;
  }


  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');

    string memory tokenString = tokenId.toString();

    if (useURIPointer) {
      return string(abi.encodePacked(baseUrl, tokenString, metadataExtension));
    }

    string memory json = Base64.encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "', tokenIdToName[tokenId],
            '", "description": "', tokenIdToDescription[tokenId],
            '", "license": "', license,
            '", "image": "', baseImgUrl, tokenString, imgExtension,
            '", "external_url": "', baseExternalUrl, tokenString,
            '", "tokenId": "', tokenString,
            '", "attributes": "', tokenIdToAttributes[tokenId],
            '"}'
          )
        )
      )
    );
    return string(abi.encodePacked('data:application/json;base64,', json));
  }

  function flipUseURIPointer() public onlyOwner {
    useURIPointer = !useURIPointer;
  }

  function updateBaseUrl(string memory _baseUrl, string memory _metadataExtension) public onlyOwner {
    baseUrl = _baseUrl;
    metadataExtension = _metadataExtension;
  }


  function updateMetadataParams(
    string memory _baseImgUrl,
    string memory _imgExtension,
    string memory _baseExternalUrl,
    string memory _license
  ) public onlyOwner {
    baseImgUrl = _baseImgUrl;
    imgExtension = _imgExtension;
    baseExternalUrl = _baseExternalUrl;
    license = _license;
  }


  function updateTokenName(uint256 tokenId, string memory _name) public onlyOwner {
    tokenIdToName[tokenId] = _name;
  }

  function updateTokenDescription(uint256 tokenId, string memory _description) public onlyOwner {
    tokenIdToDescription[tokenId] = _description;
  }

  function updateTokenAttributes(uint256 tokenId, string memory _attributes) public onlyOwner {
    tokenIdToAttributes[tokenId] = _attributes;
  }


  function emitProjectEvent(string memory _eventType, string memory _content) public onlyOwner {
    emit ProjectEvent(_msgSender(), _eventType, _content);
  }

  function emitTokenEvent(uint256 tokenId, string memory _eventType, string memory _content) public {
    require(
      owner() == _msgSender() || ERC721.ownerOf(tokenId) == _msgSender(),
      'Only project or token owner can emit token event'
    );
    emit TokenEvent(_msgSender(), tokenId, _eventType, _content);
  }

  function updatRoyaltyInfo(
    address _royaltyBenificiary,
    uint _royaltyBasisPoints
  ) public onlyOwner {
    royaltyBenificiary = _royaltyBenificiary;
    royaltyBasisPoints = _royaltyBasisPoints;
  }

  function royaltyInfo(uint256, uint256 _salePrice) external view returns (address, uint256) {
    return (royaltyBenificiary, _salePrice * royaltyBasisPoints / 10000);
  }

  function setOperatorDenial(address operator, bool denied) public onlyOwner {
    operatorDenials[operator] = denied;
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721) {
    super._beforeTokenTransfer(from, to, tokenId);
    require(!_exists(tokenId) || ERC721.ownerOf(tokenId) == _msgSender() ||  !operatorDenials[_msgSender()], "Operator denied");
  }


  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
    return interfaceId == _INTERFACE_ID_ERC2981 || super.supportsInterface(interfaceId);
  }
}



