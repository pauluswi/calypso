export const GAME_ASSET_ABI = [
  "function mint(address to) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function transferAsset(address from, address to, uint256 tokenId) public",
  "event AssetMinted(address indexed to, uint256 indexed tokenId)",
  "event AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId)",
];
