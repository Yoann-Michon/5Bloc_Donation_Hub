// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationBadge is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    mapping(address => uint256) public lastActionTimestamp;

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
        
        mintBadge(msg.sender, metadataURI);
    }
}
