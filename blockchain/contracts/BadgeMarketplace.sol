// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BadgeMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    IERC721 public badgeContract;
    uint256 private _listingIds;
    
    mapping(uint256 => Listing) public listings;
    // Map tokenId to its active listingId (to prevent multiple listings for same token)
    mapping(uint256 => uint256) public activeListings;

    event BadgeListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event BadgeBought(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId);

    constructor(address _badgeContract) Ownable(msg.sender) {
        badgeContract = IERC721(_badgeContract);
    }

    function listBadge(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(badgeContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(badgeContract.getApproved(tokenId) == address(this) || badgeContract.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");
        require(activeListings[tokenId] == 0, "Token already listed");

        _listingIds++;
        uint256 listingId = _listingIds;

        listings[listingId] = Listing({
            listingId: listingId,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        activeListings[tokenId] = listingId;

        emit BadgeListed(listingId, tokenId, msg.sender, price);
    }

    function buyBadge(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(listing.seller != msg.sender, "Seller cannot buy their own badge");

        listing.active = false;
        activeListings[listing.tokenId] = 0;

        address seller = listing.seller;
        uint256 price = listing.price;
        uint256 tokenId = listing.tokenId;

        // Transfer badge to buyer
        badgeContract.safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer funds to seller
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Transfer to seller failed");

        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }

        emit BadgeBought(listingId, tokenId, msg.sender, seller, price);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;
        activeListings[listing.tokenId] = 0;

        emit ListingCancelled(listingId, listing.tokenId);
    }

    function getAllActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeItems = new Listing[](activeCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                activeItems[currentIndex] = listings[i];
                currentIndex++;
            }
        }
        return activeItems;
    }
}
