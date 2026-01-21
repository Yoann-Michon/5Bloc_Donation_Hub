// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationBadge is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    mapping(address => uint256) public lastActionTimestamp;

    // Badge Levels
    string constant BRONZE = "Bronze";
    string constant SILVER = "Silver";
    string constant GOLD = "Gold";

    // Thresholds (in wei) - Example values
    uint256 public constant SILVER_THRESHOLD = 0.5 ether;
    uint256 public constant GOLD_THRESHOLD = 1 ether;

    constructor() ERC721("DonationBadge", "DBDG") Ownable(msg.sender) {}

    function donate(uint256 projectId, string memory tokenURI) external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        require(balanceOf(msg.sender) < 4, "Cannot hold more than 4 badges");
        
        // Cooldown check
        require(block.timestamp >= lastActionTimestamp[msg.sender] + 5 minutes, "Cooldown active: wait 5 minutes");

        uint256 tokenId = _nextTokenId++;
        
        // Determine level (logic kept for potential event emission or other on-chain logic, 
        // though URI is now passed in)
        string memory badgeLevel;
        if (msg.value >= GOLD_THRESHOLD) {
            badgeLevel = GOLD;
        } else if (msg.value >= SILVER_THRESHOLD) {
            badgeLevel = SILVER;
        } else {
            badgeLevel = BRONZE;
        }

        // Use the passed tokenURI
        mintBadge(msg.sender, tokenURI);
        
        // Update timestamp
        lastActionTimestamp[msg.sender] = block.timestamp;
    }

    function mintBadge(address to, string memory tokenURI) private {
        _safeMint(to, _nextTokenId - 1); // _nextTokenId was incremented above
        _setTokenURI(_nextTokenId - 1, tokenURI);
    }

    // Override to enforce cooldown on transfers
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        
        // If it's a transfer (not minting or burning), enforce cooldown on sender
        if (from != address(0) && to != address(0)) {
             require(block.timestamp >= lastActionTimestamp[from] + 5 minutes, "Cooldown active for sender");
             // Update timestamp for sender?
             lastActionTimestamp[from] = block.timestamp;
        }
        
        return super._update(to, tokenId, auth);
    }

    // Required overrides
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
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
