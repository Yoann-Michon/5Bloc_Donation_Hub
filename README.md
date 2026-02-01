# 5Bloc Donation Hub

Une plateforme de dons décentralisée construite avec la technologie blockchain, intégrant des badges NFT, un contrôle d'accès basé sur les rôles et un système de privilèges complet.

## Vue d'ensemble

Donation Hub est une application Web3 full-stack qui permet des dons transparents à des projets tout en récompensant les donateurs avec des badges NFT. La plateforme inclut :

- **Intégration Blockchain** : Smart contracts sur Ethereum pour les dons et le minting de badges NFT
- **Contrôle d'Accès par Rôles** : Trois rôles utilisateurs (USER, ASSOCIATION, ADMIN) avec des permissions spécifiques
- **Système de Badges NFT** : Quatre niveaux (BRONZE, SILVER, GOLD, LEGENDARY) débloquant des privilèges progressifs
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
git clone <repository-url>
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

| Niveau | Plage Token ID | Description |
|--------|----------------|-------------|
| BRONZE | 0-99 | Badge donateur basique |
| SILVER | 100-499 | Contributeur actif |
| GOLD | 500-999 | Supporter majeur |
| LEGENDARY | 1000+ | Bienfaiteur d'élite |

### Privilèges par Niveau

| Privilège | Niveau Requis | Description |
|-----------|---------------|-------------|
| VOTE_ON_PROPOSALS | SILVER | Voter sur les propositions communautaires |
| REDUCED_FEES | SILVER | Frais de transaction réduits |
| EARLY_ACCESS_PROJECTS | GOLD | Accès anticipé aux nouveaux projets |
| CREATE_PROPOSALS | GOLD | Soumettre des propositions de gouvernance |
| PRIORITY_SUPPORT | GOLD | Support client prioritaire |
| PARTICIPATE_GOVERNANCE | LEGENDARY | Droits de gouvernance complets |

### Fusion de Badges

Combinez deux badges du même niveau pour créer un badge de niveau supérieur :
- 2x BRONZE → 1x SILVER
- 2x SILVER → 1x GOLD
- 2x GOLD → 1x LEGENDARY

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

## Détails du Workflow Docker

### Séquence de Démarrage

L'orchestration Docker Compose suit une chaîne de dépendances spécifique pour assurer une initialisation correcte :

**1. PostgreSQL (donation_hub_db)**
- Démarre en premier sans dépendances
- Crée automatiquement la base de données donation_hub
- Expose le port 5432

**2. Blockchain (donation_hub_blockchain)**
- Attend que PostgreSQL soit prêt
- Démarre le nœud Hardhat sur le port 8545
- Compile le smart contract DonationBadge.sol
- Déploie le contrat et génère contract-config.json
- Copie l'ABI (DonationBadge.json) vers le volume partagé
- Devient "healthy" quand contract-config.json existe

**3. Backend (donation_hub_backend)**
- Dépend de : PostgreSQL (démarré) + Blockchain (healthy)
- Attend jusqu'à 60 secondes pour contract-config.json
- Récupère CONTRACT_ADDRESS depuis le conteneur blockchain
- Exécute Prisma db push pour synchroniser le schéma de base de données
- Exécute le script seed pour peupler catégories et privilèges
- Démarre l'API NestJS sur le port 3000

**4. Frontend (donation_hub_frontend)**
- Dépend de : Blockchain (healthy) + Backend (démarré)
- Attend jusqu'à 60 secondes pour contract-config.json
- Récupère CONTRACT_ADDRESS et met à jour le fichier .env
- Génère src/contracts/config.ts avec l'adresse du contrat
- Démarre le serveur de développement Vite sur le port 5173

### Configuration Automatique

Le système se configure automatiquement via des volumes partagés et des scripts de démarrage :

**Distribution de l'Adresse du Contrat :**
- Le conteneur blockchain crée /app/shared/contract-config.json
- Le backend lit ce fichier et exporte CONTRACT_ADDRESS vers l'environnement
- Le script copy-contract-config.sh du frontend met à jour .env avec l'adresse
- Tous les services utilisent la même adresse de contrat déployé

**Peuplement de la Base de Données :**
Après la synchronisation du schéma, le backend crée automatiquement :
- 6 catégories de projets (Education, Environnement, Santé, DeFi, Gaming, Infrastructure)
- 6 types de privilèges avec leurs niveaux de badges requis
- Utilisateur admin par défaut (si configuré)

### Vérifications de Santé des Services

**Santé Blockchain :**
- Test : Vérifie si /app/shared/contract-config.json existe
- Intervalle : Toutes les 10 secondes
- Tentatives : 30 essais (5 minutes au total)
- Période de démarrage : 40 secondes de grâce

Cela garantit que les services dépendants ne démarrent qu'après le déploiement du contrat.

### Gestion des Volumes Docker

**postgres_data :**
- Persiste la base de données PostgreSQL entre les redémarrages de conteneurs
- Emplacement : Volume géré par Docker
- Contient toutes les données utilisateurs, projets, dons, badges

**contract_data :**
- Partagé entre blockchain, backend et frontend
- Contient contract-config.json et DonationBadge.json (ABI)
- Lecture seule pour backend et frontend (sécurité)

## Système de Privilèges Approfondi

### Fonctionnement des Privilèges

Le système de privilèges crée une couche de gamification où les permissions utilisateur sont liées à leur collection de badges NFT. Les badges de niveau supérieur débloquent plus de fonctionnalités de la plateforme.

### Détermination du Niveau de Badge

Lorsqu'un utilisateur gagne des badges NFT via des dons, le système suit son niveau le plus élevé :
- Chaque badge a un tokenId qui détermine son niveau
- Le backend synchronise les badges depuis la blockchain vers la base de données
- Niveau effectif de l'utilisateur = son niveau de badge le plus élevé
- Les privilèges sont accordés en fonction de ce niveau

### Types de Privilèges Expliqués

**VOTE_ON_PROPOSALS (SILVER+)**
Les utilisateurs peuvent participer à la gouvernance communautaire en votant sur les propositions. Cela inclut les décisions de financement de projets, les changements de plateforme et les initiatives communautaires.

**REDUCED_FEES (SILVER+)**
Les frais de transaction de la plateforme sont réduits pour les contributeurs actifs. Cela récompense les donateurs réguliers et encourage la participation continue.

**EARLY_ACCESS_PROJECTS (GOLD+)**
Les supporters majeurs reçoivent des notifications anticipées et un accès aux nouveaux projets avant le lancement public. Cela leur permet de soutenir en premier les initiatives prometteuses.

**CREATE_PROPOSALS (GOLD+)**
Les membres de confiance de la communauté peuvent soumettre des propositions au vote. Cela inclut la suggestion de nouvelles fonctionnalités, de changements de politique ou de projets spéciaux.

**PRIORITY_SUPPORT (GOLD+)**
Les utilisateurs de niveau Gold reçoivent des temps de réponse plus rapides et des canaux de support dédiés pour les problèmes ou questions de la plateforme.

**PARTICIPATE_GOVERNANCE (LEGENDARY+)**
Les bienfaiteurs d'élite ont des droits de gouvernance complets incluant un pouvoir de veto sur les décisions majeures et une influence directe sur l'orientation de la plateforme.

### Mécanisme de Protection Backend

Le backend utilise un système de protection à deux couches :

**Couche 1 : Guards de Rôles**
- Vérifie si l'utilisateur a le rôle requis (USER, ASSOCIATION, ADMIN)
- Appliqué au niveau du contrôleur
- Vérification d'authentification rapide

**Couche 2 : Guards de Privilèges**
- Vérifie si l'utilisateur a le niveau de badge requis
- Interroge la base de données pour le badge le plus élevé de l'utilisateur
- Compare avec les exigences de privilège
- Appliqué aux routes spécifiques nécessitant un accès basé sur les privilèges

### Intégration Frontend

Le frontend reflète les vérifications backend pour fournir une bonne UX :

**Rendu Conditionnel :**
Les éléments UI sont affichés/masqués en fonction des privilèges utilisateur. Par exemple, le bouton "Créer une Proposition" n'apparaît que pour les utilisateurs GOLD+.

**Dégradation Gracieuse :**
Les fonctionnalités nécessitant des privilèges supérieurs affichent des messages informatifs expliquant quel niveau de badge est nécessaire et comment l'obtenir.

**Mises à Jour en Temps Réel :**
Après avoir gagné un nouveau badge, le frontend se synchronise avec le backend pour débloquer immédiatement les nouvelles fonctionnalités sans nécessiter de déconnexion/reconnexion.

### Synchronisation des Badges

**Synchronisation Automatique :**
- Déclenchée après chaque transaction de don
- Le backend appelle la blockchain pour récupérer les badges actuels de l'utilisateur
- Met à jour la base de données avec les nouveaux badges et niveaux
- Se produit de manière asynchrone pour éviter de bloquer le flux de don

**Synchronisation Manuelle :**
Les utilisateurs peuvent déclencher manuellement la synchronisation des badges depuis leur profil s'ils soupçonnent que les badges ne sont pas synchronisés avec la blockchain.

**Processus de Synchronisation :**
1. Le backend appelle getTokensByOwner(address) du smart contract
2. Reçoit un tableau de tokenIds possédés par l'utilisateur
3. Détermine le niveau pour chaque tokenId
4. Crée/met à jour les enregistrements UserBadge dans la base de données
5. Calcule et met en cache le niveau le plus élevé

### Considérations de Sécurité

**Double Vérification :**
Le frontend et le backend vérifient tous deux les privilèges. Les vérifications frontend évitent les appels API inutiles, les vérifications backend appliquent la sécurité.

**Validation du Wallet :**
Avant de vérifier les badges, le système vérifie que l'adresse du wallet est authentifiée via un token JWT contenant un message signé.

**Limitation de Débit :**
Les endpoints de synchronisation des badges sont limités en débit pour éviter les abus et les appels RPC blockchain excessifs.

**Repli Blockchain :**
Si les badges de la base de données sont manquants ou obsolètes, le système peut interroger directement la blockchain comme source de vérité.

### Stratégies d'Optimisation

**Mise en Cache :**
Le niveau le plus élevé de l'utilisateur est mis en cache pendant 5 minutes pour réduire les requêtes de base de données sur les routes fréquemment accédées.

**Synchronisation par Lots :**
Plusieurs opérations de badges sont regroupées en appels blockchain uniques pour minimiser la surcharge RPC.

**Chargement Paresseux :**
Les vérifications de privilèges ne se produisent que lorsque nécessaire, pas à chaque requête.

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

**Problème : Message "Cooldown period active"**

Cause : L'utilisateur a fait un don dans les 5 dernières minutes

Solutions :
- Attendre que le cooldown expire (affiché dans l'UI)
- Utiliser un compte MetaMask différent
- C'est une limitation du smart contract pour éviter le spam

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

### Optimisation des Performances

**Base de Données :**
- Le pooling de connexions Prisma est activé par défaut
- Les index sont créés sur les champs fréquemment interrogés
- Utiliser db push pour le développement, migrations pour la production

**Blockchain :**
- Le nœud Hardhat fonctionne en mémoire pour des transactions rapides
- Pas de délai de minage en mode développement
- Considérer l'utilisation de Ganache pour des tests plus réalistes

**Frontend :**
- Vite fournit un HMR (Hot Module Replacement) rapide
- Le build de production utilise le code splitting
- Les assets statiques sont mis en cache par le navigateur

**Backend :**
- NestJS utilise l'injection de dépendances efficace
- Les guards sont mis en cache par requête
- Les requêtes de base de données utilisent le moteur de requête optimisé de Prisma

## Checklist de Déploiement en Production

### Sécurité

1. **Changer tous les identifiants par défaut**
   - Générer un JWT_SECRET fort (min 32 caractères)
   - Utiliser un mot de passe de base de données sécurisé
   - Ne jamais commiter les fichiers .env dans le contrôle de version

2. **Activer HTTPS/SSL**
   - Utiliser Let's Encrypt pour des certificats SSL gratuits
   - Configurer un reverse proxy (Nginx/Apache)
   - Forcer les redirections HTTPS

3. **Configurer CORS correctement**
   - Mettre en liste blanche uniquement votre domaine frontend
   - Supprimer les origines wildcard (*)
   - Définir credentials: true seulement si nécessaire

4. **Limitation de débit**
   - Implémenter la limitation de débit sur tous les endpoints API
   - Protéger contre les attaques DDoS
   - Utiliser Redis pour la limitation de débit distribuée

5. **Validation des entrées**
   - Valider toutes les entrées utilisateur
   - Assainir les données avant l'insertion en base de données
   - Utiliser la validation intégrée de Prisma

### Infrastructure

1. **Base de Données**
   - Utiliser PostgreSQL géré (AWS RDS, Google Cloud SQL)
   - Activer les sauvegardes automatisées
   - Configurer des réplicas en lecture pour la mise à l'échelle
   - Configurer le pooling de connexions

2. **Blockchain**
   - Déployer le contrat sur mainnet ou testnet (Sepolia, Polygon)
   - Utiliser Infura ou Alchemy pour les endpoints RPC
   - Ne jamais utiliser le nœud Hardhat en production
   - Vérifier le contrat sur Etherscan

3. **Frontend**
   - Builder le bundle de production (npm run build)
   - Servir les fichiers statiques via CDN
   - Activer la compression gzip/brotli
   - Configurer les en-têtes de cache

4. **Backend**
   - Utiliser PM2 ou un gestionnaire de processus similaire
   - Activer le clustering pour l'utilisation multi-cœurs
   - Configurer des endpoints de vérification de santé
   - Configurer la journalisation (Winston, Pino)

### Surveillance

1. **Surveillance d'application**
   - Configurer le suivi des erreurs (Sentry, Rollbar)
   - Surveiller les temps de réponse API
   - Suivre les performances des requêtes de base de données
   - Alerter sur les taux d'erreur élevés

2. **Surveillance d'infrastructure**
   - Surveiller les ressources serveur (CPU, RAM, disque)
   - Suivre la santé des conteneurs
   - Configurer la surveillance de disponibilité
   - Configurer les alertes (PagerDuty, Slack)

3. **Surveillance blockchain**
   - Surveiller les événements du contrat
   - Suivre les prix du gaz
   - Alerter sur les transactions échouées
   - Surveiller les soldes des wallets

### Considérations de Mise à l'Échelle

1. **Mise à l'échelle horizontale**
   - Utiliser un équilibreur de charge pour plusieurs instances backend
   - Conception API sans état pour une mise à l'échelle facile
   - Stockage de session dans Redis, pas en mémoire

2. **Mise à l'échelle de la base de données**
   - Implémenter des réplicas en lecture
   - Utiliser le pooling de connexions
   - Considérer le sharding de base de données pour les grands ensembles de données

3. **Stratégie de mise en cache**
   - Redis pour la mise en cache de session et de données
   - CDN pour les assets statiques
   - Mise en cache des réponses API le cas échéant

## Licence

Licence MIT - Voir le fichier LICENSE pour les détails

## Version

**Version** : 1.0.0
