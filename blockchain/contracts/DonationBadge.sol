// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationBadge is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _tokenIds;

    mapping(address => uint256) public lastActionTimestamp;
    mapping(uint256 => uint256) public projectBalances; // projectId => balance
    mapping(uint256 => address) public projectOwners; // projectId => owner address
    mapping(uint256 => uint256) public tokenTiers; // tokenId => tier (0: Bronze, 1: Silver, 2: Gold, 3: Diamond)

    event FundsReceived(uint256 indexed projectId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount);

    constructor() ERC721("DonationBadge", "DBDG") Ownable(msg.sender) {}

    function mintBadge(address recipient, string memory uri, uint256 tier) private {
        require(balanceOf(msg.sender) < 10, "Limite de 10 badges atteinte"); 
        require(block.timestamp >= lastActionTimestamp[msg.sender] + 5 minutes || lastActionTimestamp[msg.sender] == 0, "Cooldown de 5 minutes actif");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, uri);
        tokenTiers[newItemId] = tier;

        lastActionTimestamp[msg.sender] = block.timestamp;
    }

    function donate(uint256 projectId, string memory metadataURI) external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        projectBalances[projectId] += msg.value;
        emit FundsReceived(projectId, msg.sender, msg.value);

        uint256 tier;
        if (msg.value < 6 ether) tier = 0;
        else if (msg.value < 11 ether) tier = 1;
        else if (msg.value < 21 ether) tier = 2;
        else tier = 3;

        mintBadge(msg.sender, metadataURI, tier);
    }

    function setProjectOwner(uint256 projectId, address projectOwner) external onlyOwner {
        require(projectOwner != address(0), "Invalid owner address");
        projectOwners[projectId] = projectOwner;
    }

    function withdrawProjectFunds(uint256 projectId, address payable recipient) external onlyOwner {
        require(projectOwners[projectId] != address(0), "Project owner not set");
        require(recipient == projectOwners[projectId], "Recipient must be project owner");

        uint256 amount = projectBalances[projectId];
        require(amount > 0, "No funds available");

        projectBalances[projectId] = 0;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(projectId, recipient, amount);
    }

    function getProjectBalance(uint256 projectId) external view returns (uint256) {
        return projectBalances[projectId];
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     * Uses ERC721Enumerable for safe and efficient enumeration.
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokens;
    }

    function getTierFromTokenId(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return tokenTiers[tokenId];
    }

    function fuseBadges(uint256 tokenId1, uint256 tokenId2, string memory newMetadataURI) external {
        require(ownerOf(tokenId1) == msg.sender, "Not owner of token1");
        require(ownerOf(tokenId2) == msg.sender, "Not owner of token2");
        require(tokenId1 != tokenId2, "Cannot fuse same token");

        uint256 tier1 = getTierFromTokenId(tokenId1);
        uint256 tier2 = getTierFromTokenId(tokenId2);

        require(tier1 == tier2, "Badges must be same tier");
        require(tier1 < 3, "Cannot fuse DIAMOND badges");

        _burn(tokenId1);
        _burn(tokenId2);

        // Reset cooldown specifically for fusion to allow immediate result
        lastActionTimestamp[msg.sender] = 0; 
        mintBadge(msg.sender, newMetadataURI, tier1 + 1);
    }

    // Required overrides for ERC721Enumerable and ERC721URIStorage
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
