# Cahier des Charges Backend - Community Donation Hub

## 📋 Table des Matières

1. [Contexte et Objectifs](#1-contexte-et-objectifs)
2. [Architecture Globale](#2-architecture-globale)
3. [Smart Contracts](#3-smart-contracts)
4. [Services Backend](#4-services-backend)
5. [Base de Données](#5-base-de-données)
6. [APIs et Endpoints](#6-apis-et-endpoints)
7. [Intégration IPFS](#7-intégration-ipfs)
8. [Blockchain Indexing](#8-blockchain-indexing)
9. [Sécurité](#9-sécurité)
10. [Performance et Scalabilité](#10-performance-et-scalabilité)
11. [Monitoring et Logs](#11-monitoring-et-logs)
12. [Déploiement](#12-déploiement)

---

## 1. Contexte et Objectifs

### 1.1 Vue d'ensemble

Community Donation Hub est une DApp décentralisée permettant aux utilisateurs de faire des dons à des projets communautaires et de recevoir des badges tokenisés (NFT) représentant leur niveau de contribution.

### 1.2 Objectifs du Backend

- **Smart Contracts** : Gérer la logique métier décentralisée (donations, tokens, conversions)
- **API Backend** : Fournir des données enrichies et agrégées au front-end
- **Indexation Blockchain** : Suivre et indexer les événements blockchain en temps réel
- **IPFS** : Stocker et récupérer les métadonnées des tokens
- **Cache** : Optimiser les performances et réduire les appels blockchain coûteux

### 1.3 Contraintes Techniques

- **Blockchain** : Ethereum (Mainnet ou Testnet Sepolia)
- **Smart Contracts** : Solidity ^0.8.20
- **Framework** : Hardhat pour développement et tests
- **Standards** : ERC-721 ou custom token standard
- **Stockage décentralisé** : IPFS via Pinata ou Infura
- **Backend API** : Node.js + Express ou NestJS
- **Base de données** : PostgreSQL + Redis (cache)

---

## 2. Architecture Globale

### 2.1 Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                     (React + ethers.js)                      │
└───────────────┬─────────────────────────────────────────────┘
                │
                ├──────────────┬─────────────────┬─────────────┐
                ▼              ▼                 ▼             ▼
        ┌──────────────┐  ┌──────────┐  ┌─────────────┐  ┌────────┐
        │   ETHEREUM   │  │ BACKEND  │  │    IPFS     │  │  CDN   │
        │   NETWORK    │  │   API    │  │  (Pinata)   │  │ Images │
        │              │  │          │  │             │  │        │
        │ Smart        │  │ Express  │  │ Metadata    │  │ Assets │
        │ Contracts    │  │ REST API │  │ Storage     │  │        │
        └──────┬───────┘  └────┬─────┘  └─────────────┘  └────────┘
               │               │
               │               ├──────────────┐
               │               ▼              ▼
               │         ┌──────────┐   ┌──────────┐
               │         │PostgreSQL│   │  Redis   │
               │         │   DB     │   │  Cache   │
               │         └──────────┘   └──────────┘
               │
               ├────────────────────────────┐
               ▼                            ▼
        ┌─────────────┐             ┌─────────────┐
        │  INDEXER    │             │   RPC Node  │
        │  (The Graph │             │  (Infura/   │
        │  or Custom) │             │   Alchemy)  │
        └─────────────┘             └─────────────┘
```

### 2.2 Flux de Données

#### Donation Flow
```
1. User → Front → Smart Contract : Donation transaction
2. Smart Contract → Event emitted : DonationMade
3. Indexer → Catch event → Store in DB
4. Smart Contract → Mint Token NFT → Event TokenMinted
5. Smart Contract → Upload metadata to IPFS → Store CID
6. Backend API → Frontend : Updated stats and user badges
```

#### Token Conversion Flow
```
1. User → Front → Smart Contract : Convert 2 Donor → 1 Sponsor
2. Smart Contract → Validate (has 2 Donor tokens, no cooldown)
3. Smart Contract → Burn 2 Donor tokens → Mint 1 Sponsor token
4. Smart Contract → Event TokenConverted
5. Indexer → Update DB with new token state
```

---

## 3. Smart Contracts

### 3.1 Architecture des Contrats

#### 3.1.1 Contrat Principal : `DonationHub.sol`

**Responsabilités :**
- Gérer les donations
- Minter les badges NFT selon le montant
- Gérer les conversions de tokens
- Gérer les échanges entre utilisateurs
- Appliquer les contraintes temporelles (cooldown, lock)

**Variables d'État :**

```solidity
// Token levels
enum TokenLevel { DONOR, SPONSOR, PATRON, BENEFACTOR }

// Token structure
struct DonationToken {
    uint256 tokenId;
    TokenLevel level;
    uint256 donationAmount;
    string metadataURI; // IPFS CID
    uint256 mintedAt;
    uint256 lastTransferAt;
}

// User state
mapping(address => uint256) public userTokenCount; // Max 4
mapping(address => uint256) public lastTransactionTime; // Cooldown
mapping(address => uint256) public lockEndTime; // Lock after critical action
mapping(address => uint256[]) public userTokens; // Token IDs owned

// Projects
struct Project {
    uint256 projectId;
    address creator;
    string metadataURI; // IPFS CID
    uint256 fundingGoal;
    uint256 totalRaised;
    uint256 deadline;
    bool isActive;
}

mapping(uint256 => Project) public projects;
uint256 public projectCount;

// Donations tracking
mapping(uint256 => uint256) public projectDonations; // projectId => total
mapping(address => mapping(uint256 => uint256)) public userDonationsToProject;

// Constants
uint256 public constant MAX_TOKENS_PER_USER = 4;
uint256 public constant COOLDOWN_DURATION = 5 minutes;
uint256 public constant LOCK_DURATION = 10 minutes;
```

**Fonctions Principales :**

```solidity
// Donations
function donate(uint256 _projectId) external payable
function createProject(string calldata _metadataURI, uint256 _fundingGoal, uint256 _duration) external
function closeProject(uint256 _projectId) external

// Token Management
function mintBadge(address _to, uint256 _amount) internal returns (uint256)
function convertTokens(uint256 _tokenId1, uint256 _tokenId2) external
function transferToken(address _to, uint256 _tokenId) external

// Queries
function getUserTokens(address _user) external view returns (DonationToken[] memory)
function getProjectDetails(uint256 _projectId) external view returns (Project memory)
function getUserStats(address _user) external view returns (uint256 totalDonated, uint256 tokenCount, TokenLevel highestLevel)

// Admin
function withdrawFunds(uint256 _projectId) external
function pauseContract() external onlyOwner
```

**Events :**

```solidity
event ProjectCreated(uint256 indexed projectId, address indexed creator, uint256 fundingGoal);
event DonationMade(uint256 indexed projectId, address indexed donor, uint256 amount, TokenLevel badgeLevel);
event TokenMinted(address indexed owner, uint256 indexed tokenId, TokenLevel level, string metadataURI);
event TokenConverted(address indexed owner, uint256[] burnedTokenIds, uint256 newTokenId, TokenLevel newLevel);
event TokenTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
event ProjectClosed(uint256 indexed projectId, uint256 totalRaised);
event FundsWithdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount);
```

### 3.2 Règles Métier Implémentées

#### 3.2.1 Niveaux de Badges (Token Levels)

| Niveau       | Montant Min (ETH) | Token Level | Couleur UI |
|--------------|-------------------|-------------|------------|
| Donor        | 0.01 - 0.09       | 0           | #94A3B8    |
| Sponsor      | 0.1 - 0.49        | 1           | #60A5FA    |
| Patron       | 0.5 - 0.99        | 2           | #A78BFA    |
| Benefactor   | 1.0+              | 3           | #F59E0B    |

**Fonction de calcul :**

```solidity
function _calculateTokenLevel(uint256 _amount) internal pure returns (TokenLevel) {
    if (_amount >= 1 ether) return TokenLevel.BENEFACTOR;
    if (_amount >= 0.5 ether) return TokenLevel.PATRON;
    if (_amount >= 0.1 ether) return TokenLevel.SPONSOR;
    return TokenLevel.DONOR;
}
```

#### 3.2.2 Règles de Conversion

```solidity
mapping(TokenLevel => TokenLevel) public conversionMap;
// DONOR (2x) → SPONSOR
// SPONSOR (2x) → PATRON
// PATRON (2x) → BENEFACTOR

function convertTokens(uint256 _tokenId1, uint256 _tokenId2) external {
    require(!_isInCooldown(msg.sender), "Cooldown active");
    require(!_isLocked(msg.sender), "Account locked");
    
    DonationToken memory token1 = tokens[_tokenId1];
    DonationToken memory token2 = tokens[_tokenId2];
    
    require(token1.owner == msg.sender && token2.owner == msg.sender, "Not owner");
    require(token1.level == token2.level, "Different levels");
    require(token1.level != TokenLevel.BENEFACTOR, "Already max level");
    require(userTokenCount[msg.sender] < MAX_TOKENS_PER_USER, "Max tokens reached");
    
    // Burn old tokens
    _burn(_tokenId1);
    _burn(_tokenId2);
    
    // Mint new token (next level)
    TokenLevel newLevel = TokenLevel(uint8(token1.level) + 1);
    uint256 newTokenId = _mintBadge(msg.sender, newLevel);
    
    // Apply cooldown and lock
    lastTransactionTime[msg.sender] = block.timestamp;
    lockEndTime[msg.sender] = block.timestamp + LOCK_DURATION;
    
    emit TokenConverted(msg.sender, [_tokenId1, _tokenId2], newTokenId, newLevel);
}
```

#### 3.2.3 Contraintes Temporelles

```solidity
function _isInCooldown(address _user) internal view returns (bool) {
    return block.timestamp < lastTransactionTime[_user] + COOLDOWN_DURATION;
}

function _isLocked(address _user) internal view returns (bool) {
    return block.timestamp < lockEndTime[_user];
}

modifier noCooldown() {
    require(!_isInCooldown(msg.sender), "Cooldown period active");
    _;
}

modifier notLocked() {
    require(!_isLocked(msg.sender), "Account temporarily locked");
    _;
}
```

#### 3.2.4 Limite de 4 Tokens

```solidity
modifier checkTokenLimit() {
    require(userTokenCount[msg.sender] < MAX_TOKENS_PER_USER, "Maximum 4 tokens per user");
    _;
}

function _mintBadge(address _to, TokenLevel _level) internal checkTokenLimit returns (uint256) {
    uint256 tokenId = _nextTokenId++;
    
    // Mint token
    tokens[tokenId] = DonationToken({
        tokenId: tokenId,
        level: _level,
        owner: _to,
        donationAmount: msg.value,
        metadataURI: "", // Will be set after IPFS upload
        mintedAt: block.timestamp,
        lastTransferAt: block.timestamp
    });
    
    userTokens[_to].push(tokenId);
    userTokenCount[_to]++;
    
    return tokenId;
}
```

### 3.3 Sécurité des Smart Contracts

#### 3.3.1 Protections Implémentées

- **ReentrancyGuard** : Protéger contre les attaques de réentrance
- **Pausable** : Pouvoir mettre en pause le contrat en cas d'urgence
- **Ownable** : Fonctions admin réservées au owner
- **Checks-Effects-Interactions** : Pattern pour éviter les vulnérabilités
- **SafeMath** : Solidity 0.8+ avec overflow protection intégré

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationHub is ReentrancyGuard, Pausable, Ownable {
    
    function donate(uint256 _projectId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        noCooldown
        notLocked
    {
        require(msg.value >= 0.01 ether, "Minimum 0.01 ETH");
        require(projects[_projectId].isActive, "Project not active");
        
        // Effects
        projects[_projectId].totalRaised += msg.value;
        userDonationsToProject[msg.sender][_projectId] += msg.value;
        
        // Mint badge
        TokenLevel level = _calculateTokenLevel(msg.value);
        uint256 tokenId = _mintBadge(msg.sender, level);
        
        // Update state
        lastTransactionTime[msg.sender] = block.timestamp;
        
        // Emit event
        emit DonationMade(_projectId, msg.sender, msg.value, level);
        emit TokenMinted(msg.sender, tokenId, level, "");
    }
}
```

#### 3.3.2 Validations

- Vérifier que les adresses ne sont pas `address(0)`
- Vérifier que les montants sont > 0
- Vérifier la propriété des tokens avant transfert/conversion
- Vérifier que les projets existent et sont actifs
- Vérifier les deadlines des projets

### 3.4 Tests Smart Contracts

**Couverture minimale : 80%**

**Fichiers de tests :**

```
test/
├── DonationHub.test.js          # Tests généraux
├── Donation.test.js             # Tests de donation
├── TokenManagement.test.js      # Mint, burn, transfer
├── TokenConversion.test.js      # Tests de conversion
├── TimeConstraints.test.js      # Cooldown et lock
├── ProjectManagement.test.js    # Création, clôture projets
├── Security.test.js             # Tests de sécurité
└── Integration.test.js          # Tests end-to-end
```

**Scénarios à tester :**

1. **Donations**
   - Donation valide → badge correct
   - Donation < 0.01 ETH → revert
   - Donation vers projet inexistant → revert
   - Donation vers projet fermé → revert
   - Limite 4 tokens atteinte → revert

2. **Conversions**
   - 2 Donor → 1 Sponsor ✓
   - 2 Sponsor → 1 Patron ✓
   - 2 Patron → 1 Benefactor ✓
   - Conversion niveaux différents → revert
   - Conversion avec < 2 tokens → revert
   - Conversion pendant cooldown → revert

3. **Contraintes temporelles**
   - Transaction pendant cooldown → revert
   - Transaction après cooldown → success
   - Action pendant lock → revert
   - Action après lock → success

4. **Transferts**
   - Transfert valide → success
   - Transfert vers destinataire avec 4 tokens → revert
   - Transfert d'un token non possédé → revert

5. **Sécurité**
   - Reentrancy attack → blocked
   - Overflow/underflow → handled by Solidity 0.8+
   - Unauthorized access → revert

---

## 4. Services Backend

### 4.1 Architecture Backend

**Stack Technologique :**
- **Framework** : NestJS (Node.js)
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Cache** : Redis
- **Queue** : Bull (pour jobs asynchrones)
- **Blockchain interaction** : ethers.js v6

### 4.2 Structure du Backend

```
backend/
├── src/
│   ├── modules/
│   │   ├── blockchain/          # Interaction blockchain
│   │   │   ├── blockchain.service.ts
│   │   │   ├── contract.service.ts
│   │   │   └── event-listener.service.ts
│   │   ├── projects/            # Gestion projets
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   └── dto/
│   │   ├── donations/           # Gestion donations
│   │   │   ├── donations.controller.ts
│   │   │   ├── donations.service.ts
│   │   │   └── dto/
│   │   ├── tokens/              # Gestion tokens NFT
│   │   │   ├── tokens.controller.ts
│   │   │   ├── tokens.service.ts
│   │   │   └── dto/
│   │   ├── users/               # Gestion utilisateurs
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── ipfs/                # Service IPFS
│   │   │   ├── ipfs.service.ts
│   │   │   └── metadata.service.ts
│   │   ├── indexer/             # Indexation blockchain
│   │   │   ├── indexer.service.ts
│   │   │   └── event-processor.service.ts
│   │   ├── stats/               # Statistiques
│   │   │   ├── stats.controller.ts
│   │   │   └── stats.service.ts
│   │   └── cache/               # Service de cache
│   │       └── cache.service.ts
│   ├── common/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── decorators/
│   ├── config/
│   │   ├── blockchain.config.ts
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── package.json
└── tsconfig.json
```

### 4.3 Services Principaux

#### 4.3.1 BlockchainService

**Responsabilités :**
- Connexion au nœud Ethereum (Infura/Alchemy)
- Lecture des données blockchain
- Estimation de gas
- Vérification de transactions

```typescript
@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get('ETHEREUM_RPC_URL')
    );
    
    this.contract = new ethers.Contract(
      this.configService.get('CONTRACT_ADDRESS'),
      DonationHubABI,
      this.provider
    );
  }

  async getProjectDetails(projectId: number): Promise<Project> {
    const project = await this.contract.getProjectDetails(projectId);
    return this.formatProject(project);
  }

  async getUserTokens(address: string): Promise<Token[]> {
    const tokens = await this.contract.getUserTokens(address);
    return tokens.map(this.formatToken);
  }

  async estimateGas(method: string, params: any[]): Promise<bigint> {
    return await this.contract[method].estimateGas(...params);
  }

  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }
}
```

#### 4.3.2 IndexerService

**Responsabilités :**
- Écouter les événements blockchain en temps réel
- Indexer les événements dans la base de données
- Mettre à jour le cache

```typescript
@Injectable()
export class IndexerService implements OnModuleInit {
  constructor(
    private blockchainService: BlockchainService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async onModuleInit() {
    await this.startListening();
  }

  private async startListening() {
    const contract = this.blockchainService.getContract();

    // Listen to DonationMade events
    contract.on('DonationMade', async (projectId, donor, amount, badgeLevel, event) => {
      await this.handleDonationEvent({
        projectId: projectId.toString(),
        donor,
        amount: amount.toString(),
        badgeLevel: badgeLevel.toString(),
        transactionHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber,
      });
    });

    // Listen to TokenMinted events
    contract.on('TokenMinted', async (owner, tokenId, level, metadataURI, event) => {
      await this.handleTokenMintedEvent({
        owner,
        tokenId: tokenId.toString(),
        level: level.toString(),
        metadataURI,
        transactionHash: event.log.transactionHash,
      });
    });

    // Other events...
  }

  private async handleDonationEvent(data: DonationEventData) {
    // Store in database
    await this.prisma.donation.create({
      data: {
        projectId: parseInt(data.projectId),
        donor: data.donor,
        amount: data.amount,
        transactionHash: data.transactionHash,
        blockNumber: data.blockNumber,
        timestamp: new Date(),
      },
    });

    // Invalidate cache
    await this.cacheService.del(`project:${data.projectId}`);
    await this.cacheService.del(`user:${data.donor}:donations`);
  }
}
```

#### 4.3.3 IPFSService

**Responsabilités :**
- Upload des métadonnées vers IPFS
- Récupération des métadonnées depuis IPFS
- Génération des métadonnées JSON

```typescript
@Injectable()
export class IPFSService {
  private pinata: PinataClient;

  constructor(private configService: ConfigService) {
    this.pinata = new PinataClient(
      this.configService.get('PINATA_API_KEY'),
      this.configService.get('PINATA_SECRET_KEY'),
    );
  }

  async uploadMetadata(metadata: TokenMetadata): Promise<string> {
    const json = JSON.stringify(metadata, null, 2);
    
    const result = await this.pinata.pinJSONToIPFS(json, {
      pinataMetadata: {
        name: `token-${metadata.tokenId}-metadata.json`,
      },
    });

    return result.IpfsHash; // CID
  }

  async getMetadata(cid: string): Promise<TokenMetadata> {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    return response.data;
  }

  generateMetadata(token: Token, donation: Donation): TokenMetadata {
    return {
      name: `${TokenLevel[token.level]} Badge #${token.tokenId}`,
      description: `Donation badge for contributing ${ethers.formatEther(donation.amount)} ETH`,
      type: TokenLevel[token.level],
      value: donation.amount,
      image: `https://cdn.communitydonationhub.io/badges/${token.level}.png`,
      attributes: [
        { trait_type: 'Level', value: TokenLevel[token.level] },
        { trait_type: 'Donation Amount', value: ethers.formatEther(donation.amount) },
        { trait_type: 'Project', value: donation.projectId },
      ],
      previousOwners: [token.owner],
      createdAt: token.mintedAt.toISOString(),
      lastTransferAt: token.lastTransferAt.toISOString(),
    };
  }
}
```

---

## 5. Base de Données

### 5.1 Schéma Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  address           String     @id
  tokenCount        Int        @default(0)
  totalDonated      String     @default("0") // BigInt as string
  lastTransactionAt DateTime?
  lockEndTime       DateTime?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  tokens            Token[]
  donations         Donation[]
  projects          Project[]

  @@index([totalDonated])
}

model Project {
  id              Int        @id @default(autoincrement())
  onChainId       Int        @unique
  creator         String
  metadataURI     String
  fundingGoal     String     // BigInt as string
  totalRaised     String     @default("0")
  deadline        DateTime
  isActive        Boolean    @default(true)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  closedAt        DateTime?

  creatorUser     User       @relation(fields: [creator], references: [address])
  donations       Donation[]

  @@index([isActive, deadline])
  @@index([creator])
}

model Token {
  id              Int        @id @default(autoincrement())
  tokenId         Int        @unique
  owner           String
  level           Int        // 0=DONOR, 1=SPONSOR, 2=PATRON, 3=BENEFACTOR
  donationAmount  String     // BigInt as string
  metadataURI     String
  mintedAt        DateTime
  lastTransferAt  DateTime
  isBurned        Boolean    @default(false)
  
  ownerUser       User       @relation(fields: [owner], references: [address])
  transfers       TokenTransfer[]

  @@index([owner, isBurned])
  @@index([level])
}

model Donation {
  id              Int        @id @default(autoincrement())
  projectId       Int
  donor           String
  amount          String     // BigInt as string
  transactionHash String     @unique
  blockNumber     Int
  timestamp       DateTime   @default(now())

  project         Project    @relation(fields: [projectId], references: [id])
  donorUser       User       @relation(fields: [donor], references: [address])

  @@index([projectId])
  @@index([donor])
  @@index([timestamp])
}

model TokenTransfer {
  id              Int        @id @default(autoincrement())
  tokenId         Int
  from            String
  to              String
  transactionHash String
  timestamp       DateTime   @default(now())

  token           Token      @relation(fields: [tokenId], references: [id])

  @@index([tokenId])
  @@index([from])
  @@index([to])
}

model TokenConversion {
  id              Int        @id @default(autoincrement())
  owner           String
  burnedTokenIds  Int[]
  newTokenId      Int
  fromLevel       Int
  toLevel         Int
  transactionHash String
  timestamp       DateTime   @default(now())

  @@index([owner])
  @@index([timestamp])
}

model Stats {
  id              Int        @id @default(autoincrement())
  totalProjects   Int        @default(0)
  totalDonations  String     @default("0") // Total en ETH
  totalDonors     Int        @default(0)
  totalTokens     Int        @default(0)
  updatedAt       DateTime   @updatedAt
}
```

### 5.2 Migrations

```bash
# Créer une migration
npx prisma migrate dev --name init

# Appliquer les migrations en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

---

## 6. APIs et Endpoints

### 6.1 REST API

**Base URL :** `https://api.communitydonationhub.io/v1`

#### 6.1.1 Projects

```typescript
// GET /projects
// Récupérer tous les projets avec pagination et filtres
GET /api/v1/projects?page=1&limit=20&status=active&category=education

Response 200:
{
  "data": [
    {
      "id": 1,
      "onChainId": 1,
      "creator": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "title": "Education for All",
      "description": "...",
      "category": "education",
      "fundingGoal": "10000000000000000000", // 10 ETH
      "totalRaised": "5500000000000000000",  // 5.5 ETH
      "progress": 55,
      "deadline": "2026-06-01T00:00:00.000Z",
      "isActive": true,
      "donorsCount": 42,
      "imageUrl": "https://ipfs.io/ipfs/Qm...",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}

// GET /projects/:id
// Récupérer un projet spécifique
GET /api/v1/projects/1

Response 200:
{
  "id": 1,
  "onChainId": 1,
  "creator": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "title": "Education for All",
  "description": "Full description...",
  "category": "education",
  "fundingGoal": "10000000000000000000",
  "totalRaised": "5500000000000000000",
  "progress": 55,
  "deadline": "2026-06-01T00:00:00.000Z",
  "isActive": true,
  "donorsCount": 42,
  "recentDonations": [...],
  "topDonors": [...],
  "updates": [...],
  "createdAt": "2026-01-15T10:30:00.000Z"
}

// POST /projects
// Créer un nouveau projet (off-chain d'abord, puis on-chain)
POST /api/v1/projects
Body:
{
  "title": "New Project",
  "description": "Description",
  "category": "education",
  "fundingGoal": "5000000000000000000", // 5 ETH
  "duration": 90, // days
  "images": ["base64..."],
  "creator": "0x..."
}

Response 201:
{
  "projectId": 151,
  "metadataURI": "QmXXX...",
  "message": "Project created. Please confirm on-chain transaction."
}
```

#### 6.1.2 Donations

```typescript
// GET /donations
// Récupérer toutes les donations (avec filtres)
GET /api/v1/donations?projectId=1&donor=0x...&limit=50

Response 200:
{
  "data": [
    {
      "id": 1,
      "projectId": 1,
      "projectTitle": "Education for All",
      "donor": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "amount": "1000000000000000000", // 1 ETH
      "amountFormatted": "1.0 ETH",
      "badgeLevel": "SPONSOR",
      "transactionHash": "0xabc...",
      "timestamp": "2026-01-19T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 523,
    "page": 1,
    "limit": 50
  }
}

// GET /donations/recent
// Récupérer les donations récentes (24h)
GET /api/v1/donations/recent?limit=10

// GET /donations/:transactionHash
// Récupérer une donation spécifique
GET /api/v1/donations/0xabc123...
```

#### 6.1.3 Tokens

```typescript
// GET /tokens/user/:address
// Récupérer tous les tokens d'un utilisateur
GET /api/v1/tokens/user/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

Response 200:
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "tokenCount": 3,
  "tokens": [
    {
      "tokenId": 123,
      "level": "SPONSOR",
      "levelNumber": 1,
      "donationAmount": "1000000000000000000",
      "metadataURI": "QmXXX...",
      "metadata": {
        "name": "Sponsor Badge #123",
        "description": "...",
        "image": "https://...",
        "attributes": [...]
      },
      "mintedAt": "2026-01-19T14:30:00.000Z",
      "canConvert": true // Si l'utilisateur a 2 tokens du même niveau
    }
  ]
}

// GET /tokens/:tokenId
// Récupérer un token spécifique
GET /api/v1/tokens/123

// GET /tokens/:tokenId/history
// Récupérer l'historique d'un token
GET /api/v1/tokens/123/history

Response 200:
{
  "tokenId": 123,
  "transfers": [
    {
      "from": "0x000...",
      "to": "0x742...",
      "transactionHash": "0xabc...",
      "timestamp": "2026-01-19T14:30:00.000Z"
    }
  ]
}
```

#### 6.1.4 Users

```typescript
// GET /users/:address
// Récupérer le profil d'un utilisateur
GET /api/v1/users/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

Response 200:
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "tokenCount": 3,
  "totalDonated": "3500000000000000000", // 3.5 ETH
  "totalDonatedFormatted": "3.5 ETH",
  "highestLevel": "PATRON",
  "badges": {
    "DONOR": 1,
    "SPONSOR": 1,
    "PATRON": 1,
    "BENEFACTOR": 0
  },
  "projectsSupported": 5,
  "lastDonation": "2026-01-19T14:30:00.000Z",
  "memberSince": "2026-01-10T08:00:00.000Z",
  "isInCooldown": false,
  "isLocked": false,
  "cooldownEndsAt": null,
  "lockEndsAt": null
}

// GET /users/:address/donations
// Récupérer l'historique des donations d'un utilisateur
GET /api/v1/users/0x.../donations?page=1&limit=20

// GET /users/:address/activity
// Récupérer toute l'activité (donations, conversions, transfers)
GET /api/v1/users/0x.../activity
```

#### 6.1.5 Stats

```typescript
// GET /stats
// Récupérer les statistiques globales
GET /api/v1/stats

Response 200:
{
  "totalProjects": 150,
  "activeProjects": 87,
  "totalDonations": "523000000000000000000", // 523 ETH
  "totalDonationsFormatted": "523 ETH",
  "totalDonors": 1247,
  "totalTokens": 3891,
  "tokenDistribution": {
    "DONOR": 2234,
    "SPONSOR": 1103,
    "PATRON": 421,
    "BENEFACTOR": 133
  },
  "averageDonation": "0.419 ETH",
  "updatedAt": "2026-01-19T15:00:00.000Z"
}

// GET /stats/projects/:id
// Statistiques d'un projet spécifique
GET /api/v1/stats/projects/1

Response 200:
{
  "projectId": 1,
  "totalDonations": 42,
  "totalRaised": "5500000000000000000",
  "averageDonation": "0.131 ETH",
  "topDonor": {
    "address": "0x...",
    "amount": "2000000000000000000"
  },
  "donationTimeline": [
    { "date": "2026-01-15", "amount": "1.2", "count": 5 },
    { "date": "2026-01-16", "amount": "0.8", "count": 3 }
  ]
}

// GET /stats/leaderboard
// Top donateurs
GET /api/v1/stats/leaderboard?limit=100

Response 200:
{
  "leaderboard": [
    {
      "rank": 1,
      "address": "0x...",
      "totalDonated": "50000000000000000000", // 50 ETH
      "donationsCount": 23,
      "highestBadge": "BENEFACTOR"
    }
  ]
}
```

### 6.2 WebSocket API

**Endpoint :** `wss://api.communitydonationhub.io`

#### 6.2.1 Events en Temps Réel

```typescript
// Client subscription
socket.on('connect', () => {
  // S'abonner aux donations d'un projet
  socket.emit('subscribe', { channel: 'project:1:donations' });
  
  // S'abonner aux activités d'un utilisateur
  socket.emit('subscribe', { channel: 'user:0x...:activity' });
  
  // S'abonner aux stats globales
  socket.emit('subscribe', { channel: 'global:stats' });
});

// Recevoir les événements
socket.on('donation', (data) => {
  console.log('New donation:', data);
  // { projectId, donor, amount, badgeLevel, timestamp }
});

socket.on('tokenMinted', (data) => {
  console.log('Token minted:', data);
  // { owner, tokenId, level, metadataURI }
});

socket.on('tokenConverted', (data) => {
  console.log('Token converted:', data);
  // { owner, burnedTokenIds, newTokenId, newLevel }
});

socket.on('statsUpdated', (data) => {
  console.log('Stats updated:', data);
  // { totalDonations, totalProjects, ... }
});
```

### 6.3 GraphQL API (Optionnel)

Pour des requêtes plus flexibles, une API GraphQL peut être implémentée :

```graphql
type Query {
  projects(
    page: Int
    limit: Int
    status: ProjectStatus
    category: String
  ): ProjectConnection!
  
  project(id: Int!): Project
  
  donations(
    projectId: Int
    donor: String
    limit: Int
  ): [Donation!]!
  
  user(address: String!): User
  
  token(tokenId: Int!): Token
  
  stats: GlobalStats!
}

type Project {
  id: Int!
  onChainId: Int!
  creator: User!
  title: String!
  description: String!
  fundingGoal: String!
  totalRaised: String!
  progress: Float!
  deadline: DateTime!
  isActive: Boolean!
  donations: [Donation!]!
  donorsCount: Int!
}

type User {
  address: String!
  tokenCount: Int!
  totalDonated: String!
  tokens: [Token!]!
  donations: [Donation!]!
  highestLevel: TokenLevel!
}

type Token {
  tokenId: Int!
  owner: User!
  level: TokenLevel!
  donationAmount: String!
  metadata: TokenMetadata!
  mintedAt: DateTime!
}
```

---

## 7. Intégration IPFS

### 7.1 Architecture IPFS

**Service Provider :** Pinata ou Infura IPFS

**Usage :**
- Stocker les métadonnées des tokens (JSON)
- Stocker les images des badges
- Stocker les documents des projets

### 7.2 Structure des Métadonnées

**Format JSON (ERC-721 compatible) :**

```json
{
  "name": "Sponsor Badge #123",
  "description": "Donation badge for contributing 1.0 ETH to 'Education for All' project",
  "type": "SPONSOR",
  "value": "1000000000000000000",
  "image": "https://cdn.communitydonationhub.io/badges/sponsor.png",
  "external_url": "https://communitydonationhub.io/tokens/123",
  "attributes": [
    {
      "trait_type": "Level",
      "value": "SPONSOR"
    },
    {
      "trait_type": "Donation Amount",
      "value": "1.0 ETH",
      "display_type": "number"
    },
    {
      "trait_type": "Project",
      "value": "Education for All"
    },
    {
      "trait_type": "Timestamp",
      "value": 1705679400,
      "display_type": "date"
    }
  ],
  "previousOwners": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"],
  "createdAt": "2026-01-19T14:30:00.000Z",
  "lastTransferAt": "2026-01-19T14:30:00.000Z"
}
```

### 7.3 Workflow Upload IPFS

```typescript
// 1. Donation faite on-chain
// 2. Event DonationMade capturé par indexer
// 3. Backend génère les métadonnées
const metadata = {
  name: `${level} Badge #${tokenId}`,
  description: `...`,
  // ... autres champs
};

// 4. Upload vers IPFS
const cid = await ipfsService.uploadMetadata(metadata);

// 5. Mise à jour du smart contract avec le CID
await contract.setTokenMetadata(tokenId, cid);

// 6. Stockage du CID en DB pour cache
await prisma.token.update({
  where: { tokenId },
  data: { metadataURI: cid }
});
```

### 7.4 Pinning Strategy

- **Auto-pin** : Toutes les métadonnées uploadées sont automatiquement pinnées
- **Backup** : Dupliquer sur plusieurs providers (Pinata + Infura)
- **Garbage Collection** : Conserver les pins indéfiniment (aucune suppression)

---

## 8. Blockchain Indexing

### 8.1 Stratégies d'Indexation

#### Option 1 : The Graph (Recommandé)

**Avantages :**
- Décentralisé
- GraphQL API puissant
- Queries complexes
- Gestion automatique de la réorg

**Implémentation :**

```yaml
# subgraph.yaml
specVersion: 0.0.4
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum/contract
    name: DonationHub
    network: mainnet
    source:
      address: "0x..."
      abi: DonationHub
      startBlock: 18900000
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - Project
        - Donation
        - Token
        - User
      abis:
        - name: DonationHub
          file: ./abis/DonationHub.json
      eventHandlers:
        - event: DonationMade(indexed uint256,indexed address,uint256,uint8)
          handler: handleDonationMade
        - event: TokenMinted(indexed address,indexed uint256,uint8,string)
          handler: handleTokenMinted
        - event: TokenConverted(indexed address,uint256[],uint256,uint8)
          handler: handleTokenConverted
      file: ./src/mapping.ts
```

```graphql
# schema.graphql
type Project @entity {
  id: ID!
  onChainId: BigInt!
  creator: User!
  metadataURI: String!
  fundingGoal: BigInt!
  totalRaised: BigInt!
  deadline: BigInt!
  isActive: Boolean!
  donations: [Donation!]! @derivedFrom(field: "project")
  createdAt: BigInt!
}

type User @entity {
  id: ID! # address
  tokenCount: Int!
  totalDonated: BigInt!
  tokens: [Token!]! @derivedFrom(field: "owner")
  donations: [Donation!]! @derivedFrom(field: "donor")
  createdAt: BigInt!
}

type Token @entity {
  id: ID! # tokenId
  tokenId: BigInt!
  owner: User!
  level: Int!
  donationAmount: BigInt!
  metadataURI: String!
  mintedAt: BigInt!
  lastTransferAt: BigInt!
  isBurned: Boolean!
}

type Donation @entity {
  id: ID! # transactionHash
  project: Project!
  donor: User!
  amount: BigInt!
  badgeLevel: Int!
  blockNumber: BigInt!
  timestamp: BigInt!
}
```

#### Option 2 : Indexer Custom

**Si The Graph n'est pas utilisé, créer un indexer custom :**

```typescript
@Injectable()
export class CustomIndexerService {
  private lastIndexedBlock: number;

  async startIndexing() {
    // Récupérer le dernier block indexé
    this.lastIndexedBlock = await this.getLastIndexedBlock();

    // Écouter les nouveaux blocks
    this.provider.on('block', async (blockNumber) => {
      await this.indexBlock(blockNumber);
    });

    // Rattraper les blocks manquants au démarrage
    await this.catchUpBlocks();
  }

  private async indexBlock(blockNumber: number) {
    const events = await this.contract.queryFilter(
      '*', // Tous les événements
      blockNumber,
      blockNumber
    );

    for (const event of events) {
      await this.processEvent(event);
    }

    await this.updateLastIndexedBlock(blockNumber);
  }

  private async catchUpBlocks() {
    const currentBlock = await this.provider.getBlockNumber();
    
    for (let block = this.lastIndexedBlock + 1; block <= currentBlock; block++) {
      await this.indexBlock(block);
    }
  }
}
```

### 8.2 Gestion des Reorganisations

**Problème :** La blockchain peut subir des réorgs (chaînes fork)

**Solution :**

```typescript
private async handleReorg(newBlock: number, oldBlock: number) {
  // Supprimer les données du fork orphelin
  await this.prisma.donation.deleteMany({
    where: {
      blockNumber: {
        gt: newBlock
      }
    }
  });

  // Ré-indexer depuis le block commun
  await this.reindexFrom(newBlock);
}
```

---

## 9. Sécurité

### 9.1 Sécurité API

#### 9.1.1 Rate Limiting

```typescript
// Limiter les requêtes par IP
@UseGuards(ThrottlerGuard)
@Throttle(100, 60) // 100 requêtes par minute
@Controller('api/v1/projects')
export class ProjectsController {}
```

#### 9.1.2 CORS

```typescript
app.enableCors({
  origin: ['https://communitydonationhub.io'],
  methods: ['GET', 'POST'],
  credentials: true,
});
```

#### 9.1.3 Validation des Inputs

```typescript
// DTO avec class-validator
export class CreateProjectDto {
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsEthereumAddress()
  creator: string;

  @IsPositive()
  @Min(0.01)
  fundingGoal: number;
}
```

### 9.2 Sécurité Blockchain

#### 9.2.1 Validation des Adresses

```typescript
function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}
```

#### 9.2.2 Protection contre Spam

- Minimum donation: 0.01 ETH
- Cooldown: 5 minutes entre transactions
- Lock: 10 minutes après action critique

### 9.3 Sécurité Base de Données

- **Prepared Statements** : Prisma utilise automatiquement des prepared statements
- **Principe du moindre privilège** : DB user avec permissions minimales
- **Chiffrement** : Chiffrer les données sensibles at rest
- **Backups** : Backups automatiques quotidiens

### 9.4 Secrets Management

```typescript
// Utiliser des variables d'environnement
// .env (NEVER commit to git)
DATABASE_URL=postgresql://...
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/...
PINATA_API_KEY=xxx
PINATA_SECRET_KEY=xxx
JWT_SECRET=xxx
REDIS_URL=redis://...

// Charger avec @nestjs/config
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});
```

---

## 10. Performance et Scalabilité

### 10.1 Caching Strategy

#### 10.1.1 Redis Cache

```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}

// Usage
@Injectable()
export class ProjectsService {
  async getProject(id: number): Promise<Project> {
    const cacheKey = `project:${id}`;
    
    // Try cache first
    let project = await this.cacheService.get<Project>(cacheKey);
    
    if (!project) {
      // Cache miss - fetch from DB
      project = await this.prisma.project.findUnique({ where: { id } });
      
      // Store in cache (5 minutes TTL)
      await this.cacheService.set(cacheKey, project, 300);
    }
    
    return project;
  }
}
```

#### 10.1.2 Cache Invalidation

```typescript
// Invalider le cache quand les données changent
async handleDonationEvent(data: DonationEventData) {
  // Store in DB
  await this.prisma.donation.create({ data });
  
  // Invalidate related caches
  await this.cacheService.del(`project:${data.projectId}`);
  await this.cacheService.del(`user:${data.donor}:stats`);
  await this.cacheService.del('global:stats');
}
```

### 10.2 Database Optimization

#### 10.2.1 Indexes

```prisma
model Donation {
  @@index([projectId])        // Queries par projet
  @@index([donor])            // Queries par donateur
  @@index([timestamp])        // Tri par date
  @@index([projectId, donor]) // Composite pour queries combinées
}
```

#### 10.2.2 Query Optimization

```typescript
// Utiliser select pour ne récupérer que les champs nécessaires
const projects = await prisma.project.findMany({
  select: {
    id: true,
    title: true,
    totalRaised: true,
    // Ne pas inclure description si non nécessaire
  }
});

// Utiliser pagination
const projects = await prisma.project.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

### 10.3 Scalabilité Horizontale

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  API Server  │     │  API Server  │     │  API Server  │
│   Instance 1 │     │   Instance 2 │     │   Instance 3 │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Load Balancer  │
                    │   (Nginx)      │
                    └───────┬────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼───────┐    ┌───────▼──────┐    ┌───────▼──────┐
│  PostgreSQL  │    │    Redis     │    │   Indexer    │
│   (Primary)  │    │    Cluster   │    │   Service    │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 11. Monitoring et Logs

### 11.1 Logging

```typescript
// Utiliser Winston ou Pino
import { Logger } from '@nestjs/common';

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  async handleDonation(data: DonationEventData) {
    this.logger.log(`New donation: ${data.amount} ETH to project ${data.projectId}`);
    
    try {
      await this.processDonation(data);
      this.logger.log(`Donation processed successfully: ${data.transactionHash}`);
    } catch (error) {
      this.logger.error(`Failed to process donation: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 11.2 Métriques

**Tools :** Prometheus + Grafana

```typescript
// Exposer des métriques
import { Counter, Histogram } from 'prom-client';

const donationCounter = new Counter({
  name: 'donations_total',
  help: 'Total number of donations',
  labelNames: ['project_id', 'badge_level'],
});

const apiRequestDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'API request duration',
  labelNames: ['method', 'endpoint', 'status'],
});

// Incrémenter lors d'une donation
donationCounter.inc({ project_id: '1', badge_level: 'SPONSOR' });
```

### 11.3 Alerting

**Conditions d'alerte :**
- API response time > 1s
- Error rate > 5%
- Database connection pool saturated
- Indexer lag > 100 blocks
- Disk space < 20%

---

## 12. Déploiement

### 12.1 Environnements

- **Development** : Local (Hardhat network)
- **Staging** : Sepolia Testnet
- **Production** : Ethereum Mainnet

### 12.2 Infrastructure

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=donation_hub
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  indexer:
    build: ./backend
    command: npm run start:indexer
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
```

### 12.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker build -t donation-hub-api .
          docker push donation-hub-api
          # Deploy to cloud provider
```

---

## 13. Documentation API

### 13.1 Swagger/OpenAPI

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Community Donation Hub API')
  .setDescription('Backend API for Community Donation Hub DApp')
  .setVersion('1.0')
  .addTag('projects')
  .addTag('donations')
  .addTag('tokens')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Accès :** `https://api.communitydonationhub.io/api/docs`

---

## 14. Checklist de Livraison

### 14.1 Smart Contracts
- [ ] DonationHub.sol développé et testé
- [ ] Couverture tests > 80%
- [ ] Audit de sécurité (interne ou externe)
- [ ] Déployé sur testnet avec vérification Etherscan
- [ ] Documentation NatSpec complète

### 14.2 Backend API
- [ ] Tous les endpoints implémentés
- [ ] Tests unitaires et e2e
- [ ] Documentation Swagger
- [ ] Rate limiting configuré
- [ ] CORS configuré
- [ ] Logs structurés

### 14.3 Infrastructure
- [ ] Base de données PostgreSQL configurée
- [ ] Redis pour caching
- [ ] Indexer fonctionnel
- [ ] IPFS intégré (Pinata)
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Backups automatiques

### 14.4 Sécurité
- [ ] Variables d'environnement sécurisées
- [ ] Rate limiting
- [ ] Input validation
- [ ] HTTPS obligatoire
- [ ] Secrets rotation strategy

### 14.5 Performance
- [ ] Caching strategy implémentée
- [ ] Database indexes optimisés
- [ ] API response time < 500ms (p95)
- [ ] Scalabilité horizontale testée

---

## 15. Annexes

### 15.1 Glossaire

- **DApp** : Decentralized Application
- **NFT** : Non-Fungible Token
- **CID** : Content Identifier (IPFS)
- **TTL** : Time To Live (cache)
- **RPC** : Remote Procedure Call
- **ABI** : Application Binary Interface

### 15.2 Ressources

- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [The Graph Documentation](https://thegraph.com/docs/)

### 15.3 Estimations

**Durée de développement :**
- Smart Contracts : 2-3 semaines
- Backend API : 3-4 semaines
- Indexer : 1-2 semaines
- Tests & Documentation : 1-2 semaines
- **Total : 7-11 semaines**

**Coûts estimés (mensuel) :**
- Infrastructure cloud (AWS/GCP) : $200-500
- RPC Node (Infura/Alchemy) : $100-300
- IPFS Pinning (Pinata) : $20-100
- Base de données (managed) : $100-200
- Monitoring : $50-100
- **Total : $470-1200/mois**

---

## 16. Conclusion

Ce cahier des charges définit une architecture backend complète et robuste pour Community Donation Hub. L'architecture proposée garantit :

✅ **Décentralisation** via smart contracts et IPFS  
✅ **Performance** avec caching Redis et optimisation DB  
✅ **Scalabilité** horizontale pour croissance future  
✅ **Sécurité** avec validations, rate limiting, et best practices  
✅ **Maintenabilité** avec code propre et documentation  
✅ **Monitoring** pour opérations en production  

Le backend servira de pont entre la blockchain Ethereum et le frontend React, offrant une expérience utilisateur fluide tout en préservant la transparence et la traçabilité inhérentes à la technologie blockchain.

---

**Version :** 1.0  
**Date :** 19 Janvier 2026  
**Auteur :** Équipe Community Donation Hub