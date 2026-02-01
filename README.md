# 5Bloc Donation Hub

Une plateforme de dons décentralisée construite avec la technologie blockchain, intégrant des badges NFT, un contrôle d'accès basé sur les rôles et un système de privilèges complet.

## Vue d'ensemble

Donation Hub est une application Web3 full-stack qui permet des dons transparents à des projets tout en récompensant les donateurs avec des badges NFT. La plateforme inclut :

- **Intégration Blockchain** : Smart contracts sur Ethereum pour les dons et le minting de badges NFT
- **Contrôle d'Accès par Rôles** : Trois rôles utilisateurs (USER, ASSOCIATION, ADMIN) avec des permissions spécifiques
- **Système de Badges NFT** : Quatre niveaux (BRONZE, SILVER, GOLD, DIAMOND) débloquant des privilèges progressifs
- **Architecture Full-Stack** : Backend NestJS, Frontend React, Base de données PostgreSQL, Blockchain Hardhat

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    donation_hub_network                  │
│                                                          │
│  ┌──────────────┐       ┌──────────────┐               │
│  │  PostgreSQL  │◄──────┤   Backend    │               │
│  │   port 5432  │       │   port 3000  │               │
│  └──────────────┘       └───────▲──────┘               │
│                                  │                       │
│  ┌──────────────┐       ┌───────┴──────┐               │
│  │  Blockchain  │◄──────┤   Frontend   │               │
│  │   port 8545  │       │   port 5173  │               │
│  └──────────────┘       └──────────────┘               │
│         │                                                │
│         │ Volume Partagé: contract_data                 │
│         └────► /app/shared/contract-config.json         │
└─────────────────────────────────────────────────────────┘
```

## Stack Technologique

### Backend
- **Framework** : NestJS (Node.js)
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : JWT + Vérification de signature wallet
- **API** : Endpoints RESTful avec guards basés sur les rôles

### Frontend
- **Framework** : React 18 + TypeScript
- **Outil de Build** : Vite
- **Bibliothèque UI** : Material-UI (MUI)
- **Web3** : ethers.js v6
- **Gestion d'État** : React hooks
- **Animations** : GSAP, Particles.js

### Blockchain
- **Développement** : Hardhat
- **Smart Contract** : Solidity (DonationBadge.sol)
- **Réseau** : Nœud Hardhat local (développement)
- **Standards** : ERC-721 (badges NFT)

## Démarrage Rapide avec Docker

### Prérequis
- Docker et Docker Compose installés
- Extension navigateur MetaMask

### Lancer l'Application

```bash
# Cloner le dépôt
git clone git@github.com:Yoann-Michon/5Bloc_Donation_Hub.git
cd 5Bloc_Donation_Hub

# Démarrer tous les services
docker-compose up --build
```

Cette commande unique va :
1. Démarrer la base de données PostgreSQL
2. Déployer le smart contract sur le nœud Hardhat
3. Configurer le backend avec l'adresse du contrat
4. Peupler la base de données avec les catégories et privilèges
5. Lancer le frontend React

### Points d'Accès

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API Backend | http://localhost:3000 |
| RPC Blockchain | http://localhost:8545 |
| PostgreSQL | postgresql://user:password@localhost:5432/donation_hub |

### Configuration MetaMask

**Paramètres Réseau :**
- Nom du Réseau : Localhost 8545
- URL RPC : http://127.0.0.1:8545
- ID de Chaîne : 31337
- Symbole de Devise : ETH

**Importer un Compte de Test :**
1. Voir les logs blockchain : `docker logs donation_hub_blockchain`
2. Copier une clé privée depuis la sortie
3. MetaMask → Importer un compte → Coller la clé privée

## Rôles Utilisateurs et Permissions

### USER (Par défaut)
- Parcourir et faire des dons aux projets
- Gagner des badges NFT
- Voir l'historique des dons
- Accéder au système de fusion de badges

### ASSOCIATION
- Toutes les permissions USER
- Créer de nouveaux projets
- Gérer ses propres projets
- Voir les dons reçus
- Demander des retraits de fonds

### ADMIN
- Toutes les permissions ASSOCIATION
- Approuver/rejeter les projets
- Gérer les rôles utilisateurs
- Créer/éditer les catégories
- Approuver les demandes de retrait
- Gouvernance complète de la plateforme

## Système de Badges NFT

### Niveaux de Badges

| Niveau | Seuil de Donation | Description |
|--------|----------------|-------------|
| BRONZE | 0 - 5 ETH | Badge donateur basique |
| SILVER | 6 - 10 ETH | Contributeur actif |
| GOLD | 11 - 20 ETH | Supporter majeur |
| DIAMOND | 21+ ETH | Bienfaiteur d'élite |

### Privilèges par Niveau

| Privilège | Niveau Requis | Description |
|-----------|---------------|-------------|
| VOTE_ON_PROPOSALS | SILVER | Voter sur les propositions communautaires |
| REDUCED_FEES | SILVER | Frais de transaction réduits |
| EARLY_ACCESS_PROJECTS | GOLD | Accès anticipé aux nouveaux projets |
| CREATE_PROPOSALS | GOLD | Soumettre des propositions de gouvernance |
| PRIORITY_SUPPORT | GOLD | Support client prioritaire |
| PARTICIPATE_GOVERNANCE | DIAMOND | Droits de gouvernance complets |

3. **Fusion de Badges** :
   Combinez deux badges du même niveau pour créer un badge de niveau supérieur :
   - 2x BRONZE → 1x SILVER
   - 2x SILVER → 1x GOLD
   - 2x GOLD → 1x DIAMOND

4. **Marketplace de Badges** :
   Les utilisateurs peuvent acheter et vendre leurs badges contre de l'ETH sur un marché dédié. Cela permet aux donateurs de liquider leurs actifs ou aux collectionneurs d'acquérir des badges rares manquants.

### Contraintes et Sécurité

Pour garantir une économie équitable, le système impose des règles strictes :

- **Limite de Possession (Max 4)** : Un utilisateur ne peut pas posséder plus de 4 badges simultanément. Pour en acquérir de nouveaux, il doit fusionner, vendre ou transférer ses badges existants.
- **Cooldown (5 minutes)** : Un délai de 5 minutes est imposé entre deux actions (don, achat, transfert) initiées par le même utilisateur pour éviter le spam.
- **Lock d'Acquisition (10 minutes)** : Lorsqu'un utilisateur reçoit un badge (par don, achat ou transfert), ce badge est verrouillé pendant 10 minutes. Il ne peut pas être transféré ou vendu durant cette période.

## Structure du Projet

```
5Bloc_Donation_Hub/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Authentification JWT + wallet
│   │   ├── users/          # Gestion utilisateurs
│   │   ├── projects/       # CRUD projets + approbation
│   │   ├── donations/      # Suivi des dons
│   │   ├── categories/     # Catégories de projets
│   │   ├── badges/         # Sync badges NFT
│   │   ├── privileges/     # Système de privilèges
│   │   ├── guards/         # Guards rôles & privilèges
│   │   └── prisma/         # Schéma BDD & seed
│   └── Dockerfile
│
├── Donation hub/           # Frontend React
│   ├── src/
│   │   ├── pages/          # Composants pages
│   │   ├── component/      # Composants réutilisables
│   │   ├── hooks/          # Hooks React personnalisés
│   │   ├── utils/          # Client API, helpers
│   │   └── contracts/      # Config contrat (auto-généré)
│   └── Dockerfile
│
├── blockchain/             # Projet Hardhat
│   ├── contracts/
│   │   └── DonationBadge.sol
│   ├── scripts/
│   │   └── deploy.ts
│   └── Dockerfile
│
└── docker-compose.yml      # Orchestration
```

## Endpoints API

### Authentification
```
GET    /auth/nonce?walletAddress=...  # Obtenir le nonce pour signature
POST   /auth/verify                   # Vérifier la signature wallet (connexion)
GET    /auth/me                       # Obtenir l'utilisateur actuel
```

### Projets
```
GET    /projects            # Lister tous les projets approuvés
GET    /projects/:id        # Détails du projet
POST   /projects            # Créer un projet (ASSOCIATION)
PATCH  /projects/:id        # Modifier un projet (ASSOCIATION)
DELETE /projects/:id        # Supprimer un projet (ASSOCIATION)
GET    /projects/my-projects # Obtenir ses propres projets (ASSOCIATION)
PATCH  /projects/:id/approve # Approuver un projet (ADMIN)
PATCH  /projects/:id/reject  # Rejeter un projet (ADMIN)
```

### Dons
```
POST   /donations           # Enregistrer un don
GET    /donations           # Lister tous les dons
GET    /donations/by-wallet/:walletAddress  # Dons d'un utilisateur
GET    /donations/by-project/:projectId     # Dons d'un projet
GET    /donations/received                  # Dons reçus (ASSOCIATION)
```

### Utilisateurs (ADMIN uniquement)
```
GET    /users               # Lister tous les utilisateurs
PATCH  /users/:wallet/role  # Changer le rôle utilisateur
PATCH  /users/:wallet/activate    # Activer un utilisateur
PATCH  /users/:wallet/deactivate  # Désactiver un utilisateur
```

### Catégories (ADMIN uniquement)
```
GET    /categories          # Lister les catégories
POST   /categories          # Créer une catégorie
PATCH  /categories/:id      # Modifier une catégorie
DELETE /categories/:id      # Supprimer une catégorie
```

### Badges
```
GET    /badges/:wallet      # Obtenir les badges d'un utilisateur
POST   /badges/:wallet/sync # Synchroniser avec la blockchain
GET    /badges/:wallet/tier # Obtenir le niveau le plus élevé
```

## Développement

### Configuration Manuelle (Sans Docker)

#### 1. Base de Données
```bash
# Démarrer PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=donation_hub \
  postgres:16-alpine
```

#### 2. Blockchain
```bash
cd blockchain
npm install
npx hardhat node  # Terminal 1

# Terminal 2
npx hardhat run scripts/deploy.ts --network localhost
# Copier l'adresse du contrat
```

#### 3. Backend
```bash
cd backend
npm install

# Mettre à jour .env avec l'adresse du contrat
echo "CONTRACT_ADDRESS=0x..." >> .env

npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```

#### 4. Frontend
```bash
cd "Donation hub"
npm install

# Mettre à jour .env avec l'adresse du contrat
echo "VITE_CONTRACT_ADDRESS=0x..." >> .env

npm run dev
```

## Commandes Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Reconstruire et démarrer
docker-compose up --build

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Réinitialiser complètement (ATTENTION : supprime les données)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart frontend

# Accéder au shell d'un conteneur
docker exec -it donation_hub_backend sh
```

## Variables d'Environnement

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/donation_hub
JWT_SECRET=votre-clé-secrète
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...  # Auto-configuré dans Docker
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_BLOCKCHAIN_RPC_URL=http://localhost:8545
VITE_CONTRACT_ADDRESS=0x...  # Auto-configuré dans Docker
VITE_PINATA_JWT=votre-jwt-pinata  # Optionnel pour IPFS
```



## Guide de Dépannage

### Problèmes Courants et Solutions

**Problème : Le conteneur backend redémarre continuellement**

Causes possibles :
- Base de données pas encore prête
- Contrat blockchain non déployé
- Variables d'environnement manquantes

Solutions :
- Vérifier si PostgreSQL fonctionne et accepte les connexions
- Vérifier que le conteneur blockchain est healthy (contract-config.json existe)
- Examiner les logs backend pour les messages d'erreur spécifiques
- S'assurer que DATABASE_URL est correctement formaté

**Problème : Le frontend affiche l'erreur "Contract not initialized"**

Causes possibles :
- Adresse du contrat non chargée
- RPC blockchain non accessible
- MetaMask connecté au mauvais réseau

Solutions :
- Vérifier que contract-config.json existe dans le conteneur blockchain
- Vérifier que le .env du frontend a le bon VITE_CONTRACT_ADDRESS
- Redémarrer le conteneur frontend pour recharger la configuration
- S'assurer que MetaMask est sur le réseau Localhost 8545 (Chain ID: 31337)

**Problème : La transaction échoue avec "insufficient funds"**

Cause : Le compte MetaMask n'a pas d'ETH

Solution :
- Importer un compte de test depuis les logs du nœud Hardhat
- Chaque compte Hardhat commence avec 10 000 ETH
- Copier la clé privée depuis les logs blockchain et l'importer dans MetaMask

**Problème : Erreur "Badge limit reached"**

Cause : L'utilisateur a déjà 4 badges (limite du contrat)

Solutions :
- Utiliser la fusion de badges pour combiner les badges en niveaux supérieurs
- Utiliser un compte MetaMask différent
- Réinitialiser la blockchain (docker-compose down -v) pour repartir de zéro

**Problème : Message "Cooldown active" ou "Lock active"**

Cause : 
- **Cooldown** : Vous avez fait une action il y a moins de 5 minutes.
- **Lock** : Vous avez reçu un badge il y a moins de 10 minutes.

Solutions :
- Attendre l'expiration du délai (indiqué dans le message d'erreur).
- Ces sécurités sont inamovibles (Smart Contract).

**Problème : Erreurs de connexion à la base de données**

Causes possibles :
- Conteneur PostgreSQL non démarré
- DATABASE_URL incorrect
- Problèmes de connectivité réseau

Solutions :
- Vérifier que le conteneur postgres fonctionne
- Vérifier la connectivité du réseau docker
- S'assurer du format DATABASE_URL : postgresql://user:password@postgres:5432/donation_hub
- Essayer de redémarrer le conteneur postgres

**Problème : Le déploiement du smart contract échoue**

Causes possibles :
- Erreurs de compilation Hardhat
- Problèmes de configuration réseau
- Port 8545 déjà utilisé

Solutions :
- Vérifier les logs du conteneur blockchain pour les erreurs de compilation
- S'assurer qu'aucun autre processus n'utilise le port 8545
- Reconstruire le conteneur blockchain
- Vérifier la syntaxe du contrat Solidity

**Problème : Le build du frontend échoue**

Causes possibles :
- Dépendances manquantes
- Erreurs TypeScript
- Variables d'environnement non définies

Solutions :
- Nettoyer node_modules et réinstaller
- Vérifier les erreurs de compilation TypeScript dans les logs
- Vérifier que toutes les variables d'environnement VITE_ requises sont définies
- Reconstruire le conteneur frontend avec le flag --no-cache

**Problème : Configuration du Smart Contract (.env) incorrecte ou perdue**

Si les fichiers `.env` ne sont pas correctement mis à jour automatiquement ou si vous rencontrez des erreurs de contrat non trouvé :

1. **Vérifier les logs de la blockchain** pour retrouver l'adresse déployée :
   ```bash
   docker logs donation_hub_blockchain
   ```
   Cherchez une ligne ressemblant à : `DonationBadge deployed to: 0x...`

2. **Mettre à jour manuellement les fichiers .env** :
   - **Backend** (`backend/.env`) :
     ```env
     CONTRACT_ADDRESS=0x[ADRESSE_RECUPEREE]
     ```
   - **Frontend** (`Donation hub/.env`) :
     ```env
     VITE_CONTRACT_ADDRESS=0x[ADRESSE_RECUPEREE]
     ```

3. **Redémarrer les services** pour appliquer les changements :
   ```bash
   docker-compose restart backend frontend
   ```

### Étapes de Vérification

**Vérifier que tous les services fonctionnent :**
Tous les conteneurs doivent afficher le statut "Up". Blockchain et backend doivent afficher "healthy" si les vérifications de santé sont configurées.

**Tester l'API backend :**
Doit retourner la liste des catégories peuplées au format JSON.

**Tester le RPC blockchain :**
Doit retourner le numéro de bloc actuel au format hexadécimal.

**Vérifier la base de données :**
Doit afficher 6 catégories par défaut si le seed a réussi.

**Vérifier le déploiement du contrat :**
Doit afficher l'adresse du contrat et le JSON de configuration.



## Contributors

- Yoann Michon
- Achraf ElHarfi
- Abdoul Waris Konate
