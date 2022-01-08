// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;


contract MockTokenURI {
  function tokenURI(uint256 tokenId) external view returns (string memory) {
    return '{"prop": "val"}';
  }
}