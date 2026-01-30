// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationBadge is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    mapping(address => uint256) public lastActionTimestamp;
    mapping(uint256 => uint256) public projectBalances; // projectId => balance
    mapping(uint256 => address) public projectOwners; // projectId => owner address

    event FundsReceived(uint256 indexed projectId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount);

    constructor() ERC721("DonationBadge", "DBDG") Ownable(msg.sender) {}

    function mintBadge(address recipient, string memory uri) private {
        require(balanceOf(msg.sender) < 4, "Limite de 4 badges atteinte");
        require(block.timestamp >= lastActionTimestamp[msg.sender] + 5 minutes, "Cooldown de 5 minutes actif");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, uri);

        lastActionTimestamp[msg.sender] = block.timestamp;
    }

    function donate(uint256 projectId, string memory metadataURI) external payable {
        // Enforce a donation amount (implied by context, though prompt didn't explicitly specify error message for this)
        require(msg.value > 0, "Donation must be greater than 0");

        // Store funds for this project
        projectBalances[projectId] += msg.value;

        emit FundsReceived(projectId, msg.sender, msg.value);

        mintBadge(msg.sender, metadataURI);
    }

    /**
     * @dev Set the owner address for a project (only contract owner can do this)
     */
    function setProjectOwner(uint256 projectId, address projectOwner) external onlyOwner {
        require(projectOwner != address(0), "Invalid owner address");
        projectOwners[projectId] = projectOwner;
    }

    /**
     * @dev Withdraw funds for a specific project (only contract owner can approve)
     * @param projectId The ID of the project
     * @param recipient The address to send funds to (must be project owner)
     */
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

    /**
     * @dev Get balance for a specific project
     */
    function getProjectBalance(uint256 projectId) external view returns (uint256) {
        return projectBalances[projectId];
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     * This eliminates the need for ERC721Enumerable or event filtering on the frontend.
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 currentIndex = 0;

        // Loop through all minted tokens to find those owned by `owner`
        // Note: _tokenIds is the counter for the total number of minted tokens
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_ownerOf(i) == owner) {
                tokens[currentIndex] = i;
                currentIndex++;
            }
        }
        return tokens;
    }

    /**
     * @dev Get the tier of a badge based on its tokenId
     * BRONZE: 0-99, SILVER: 100-499, GOLD: 500-999, LEGENDARY: 1000+
     */
    function getTierFromTokenId(uint256 tokenId) public pure returns (uint256) {
        if (tokenId < 100) return 0;      // BRONZE
        if (tokenId < 500) return 1;      // SILVER
        if (tokenId < 1000) return 2;     // GOLD
        return 3;                          // LEGENDARY
    }

    /**
     * @dev Fuse two badges of the same tier to create one badge of higher tier
     * Requirements:
     * - Caller must own both tokens
     * - Both tokens must be the same tier
     * - Cannot fuse LEGENDARY badges (max tier)
     * - Cooldown of 5 minutes applies
     */
    function fuseBadges(uint256 tokenId1, uint256 tokenId2, string memory newMetadataURI) external {
        require(ownerOf(tokenId1) == msg.sender, "Not owner of token1");
        require(ownerOf(tokenId2) == msg.sender, "Not owner of token2");
        require(tokenId1 != tokenId2, "Cannot fuse same token");
        require(block.timestamp >= lastActionTimestamp[msg.sender] + 5 minutes, "Cooldown de 5 minutes actif");

        // Get tiers of both badges
        uint256 tier1 = getTierFromTokenId(tokenId1);
        uint256 tier2 = getTierFromTokenId(tokenId2);

        require(tier1 == tier2, "Badges must be same tier");
        require(tier1 < 3, "Cannot fuse LEGENDARY badges");

        // Burn both badges
        _burn(tokenId1);
        _burn(tokenId2);

        // Mint new badge of higher tier
        _tokenIds++;
        uint256 newTokenId;

        // Calculate new tokenId in the next tier range
        if (tier1 == 0) {
            // BRONZE -> SILVER (100-499 range)
            newTokenId = 100 + (_tokenIds % 400);
        } else if (tier1 == 1) {
            // SILVER -> GOLD (500-999 range)
            newTokenId = 500 + (_tokenIds % 500);
        } else {
            // GOLD -> LEGENDARY (1000+ range)
            newTokenId = 1000 + _tokenIds;
        }

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, newMetadataURI);

        lastActionTimestamp[msg.sender] = block.timestamp;
    }
}
