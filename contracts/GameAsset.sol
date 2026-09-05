// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameAsset is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    event AssetMinted(address indexed to, uint256 indexed tokenId);
    event AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor() ERC721("GameAsset", "GA") Ownable(msg.sender) {}

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        emit AssetMinted(to, tokenId);
        return tokenId;
    }

    function transferAsset(address from, address to, uint256 tokenId) public {
        transferFrom(from, to, tokenId);
        emit AssetTransferred(from, to, tokenId);
    }
}
