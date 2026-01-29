# Schéma de la Base de Données - Donation Hub

## Vue d'ensemble

Cette base de données PostgreSQL gère une plateforme de crowdfunding décentralisée avec badges NFT, authentification wallet, système de rôles et catégorisation des projets.

### Principe architectural fondamental

**Architecture sans boucles circulaires** : La table `User` est isolée pour l'authentification et la gestion des rôles. Les autres tables (`Project`, `Donation`, `RoleChangeLog`) référencent les wallets Ethereum comme de simples strings (`VARCHAR(42)`), **sans Foreign Keys**.

Ceci évite les dépendances circulaires du type :
```
User → Project (ownerWallet FK) ❌
Project → Donation (projectId FK)
Donation → User (donorWallet FK) ❌
= Boucle circulaire interdite
```

**Solution appliquée** :
- ✅ `Category → Project` : Foreign Key
- ✅ `Project → Donation` : Foreign Key
- ✅ `Project.ownerWallet` : Simple string (pas de FK)
- ✅ `Donation.donorWallet` : Simple string (pas de FK)

---

## Diagramme ERD (Entity-Relationship Diagram)

**Architecture sans boucles circulaires** : Les walletAddress sont des références simples, pas des Foreign Keys.

```
┌──────────────────┐
│      USER        │   Table indépendante
│──────────────────│   (Authentification + Rôles)
│ id (PK)          │
│ walletAddress UK │   ← Référencé par ownerWallet/donorWallet
│ role             │      mais SANS Foreign Key
│ organizationName │
│ email UK         │
│ nonce            │
│ isActive         │
│ lastLogin        │
└──────────────────┘

┌──────────────────┐
│   CATEGORY       │
│──────────────────│
│ id (PK)          │
│ name UK          │
│ slug UK          │
│ description      │
│ icon             │
│ color            │
└──────────────────┘
         │
         │ FK (categoryId)
         │
         ▼
┌──────────────────┐
│    PROJECT       │
│──────────────────│
│ id (PK)          │
│ title            │
│ description      │
│ goal             │
│ raised           │
│ image            │
│ status           │
│ categoryId (FK)  │───► Category.id
│ ownerWallet      │     (string, pas FK)
│ approvedBy       │     (string, pas FK)
│ approvedAt       │
└──────────────────┘
         │
         │ FK (projectId)
         │
         ▼
┌──────────────────┐
│   DONATION       │
│──────────────────│
│ id (PK)          │
│ amount           │
│ txHash UK        │
│ verified         │
│ verifiedAt       │
│ blockNumber      │
│ donorWallet      │     (string, pas FK)
│ projectId (FK)   │───► Project.id
└──────────────────┘

┌──────────────────┐
│ ROLE_CHANGE_LOG  │   Table d'audit indépendante
│──────────────────│
│ id (PK)          │
│ targetWallet     │     (string, pas FK)
│ adminWallet      │     (string, pas FK)
│ oldRole          │
│ newRole          │
│ reason           │
│ timestamp        │
└──────────────────┘
```

**Flux des données** (pas de boucles) :
- Category → Project (one-to-many)
- Project → Donation (one-to-many)
- User : table isolée, référencée par walletAddress mais sans FK

---

## Tables et Modèles

### 1. **users** - Utilisateurs de la plateforme

Stocke les informations des utilisateurs authentifiés via leur wallet Ethereum.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | UUID | PRIMARY KEY | Identifiant unique |
| **walletAddress** | VARCHAR(42) | UNIQUE, NOT NULL | Adresse Ethereum (0x...) |
| **role** | ENUM(UserRole) | NOT NULL, DEFAULT 'USER' | Rôle de l'utilisateur |
| **organizationName** | STRING | NULLABLE | Nom de l'organisation |
| **email** | STRING | NULLABLE, UNIQUE | Email de contact |
| **nonce** | STRING | NOT NULL | Nonce pour signature wallet |
| **isActive** | BOOLEAN | NOT NULL, DEFAULT true | Compte actif ou désactivé |
| **lastLogin** | TIMESTAMP | NULLABLE | Dernière connexion |
| **createdAt** | TIMESTAMP | NOT NULL, DEFAULT now() | Date de création |
| **updatedAt** | TIMESTAMP | NOT NULL, AUTO-UPDATE | Date de mise à jour |

**Enum UserRole** :
- `ADMIN` : Administrateur (approuve projets, gère rôles)
- `ASSOCIATION` : Organisation caritative (crée projets)
- `USER` : Utilisateur standard (donne des donations)

**Index** :
- PRIMARY KEY sur `id`
- UNIQUE sur `walletAddress`
- UNIQUE sur `email`
- INDEX sur `walletAddress`
- INDEX sur `role`

**Relations** :
- Aucune (table indépendante pour éviter les boucles circulaires)
- Les tables Project et Donation référencent `walletAddress` comme simple string

---

### 2. **categories** - Catégories de projets

Table normalisée des catégories de projets.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | UUID | PRIMARY KEY | Identifiant unique |
| **name** | STRING | UNIQUE, NOT NULL | Nom de la catégorie |
| **slug** | STRING | UNIQUE, NOT NULL | Slug URL-friendly |
| **description** | STRING | NULLABLE | Description |
| **icon** | STRING | NULLABLE | Emoji ou icône |
| **color** | STRING | NULLABLE | Code couleur HEX |
| **createdAt** | TIMESTAMP | NOT NULL, DEFAULT now() | Date de création |
| **updatedAt** | TIMESTAMP | NOT NULL, AUTO-UPDATE | Date de mise à jour |

**Index** :
- PRIMARY KEY sur `id`
- UNIQUE sur `name`
- UNIQUE sur `slug`
- INDEX sur `slug`

**Relations** :
- `projects` → Une Category peut contenir N Projects (1:N)

**Catégories par défaut** (créées via seed) :
- Education (📚, #3B82F6)
- Environment (🌍, #10B981)
- Health (🏥, #EF4444)
- DeFi (💰, #F59E0B)
- Gaming (🎮, #8B5CF6)
- Infrastructure (🏗️, #6B7280)

---

### 3. **projects** - Projets de crowdfunding

Projets soumis par les associations pour financement.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | INTEGER | PRIMARY KEY, AUTO-INCREMENT | Identifiant unique |
| **title** | STRING | NOT NULL | Titre du projet |
| **description** | TEXT | NOT NULL | Description complète |
| **goal** | DECIMAL(18,4) | NOT NULL | Objectif en ETH |
| **raised** | DECIMAL(18,4) | NOT NULL, DEFAULT 0 | Montant collecté |
| **image** | STRING | NULLABLE | URL de l'image |
| **status** | ENUM(ProjectStatus) | NOT NULL, DEFAULT 'PENDING' | Statut du projet |
| **categoryId** | UUID | FOREIGN KEY, NOT NULL | Catégorie |
| **ownerWallet** | VARCHAR(42) | NOT NULL | Wallet créateur (référence simple) |
| **approvedBy** | VARCHAR(42) | NULLABLE | Wallet admin (référence simple) |
| **approvedAt** | TIMESTAMP | NULLABLE | Date d'approbation |
| **createdAt** | TIMESTAMP | NOT NULL, DEFAULT now() | Date de création |
| **updatedAt** | TIMESTAMP | NOT NULL, AUTO-UPDATE | Date de mise à jour |

**Enum ProjectStatus** :
- `PENDING` : En attente de validation admin
- `APPROVED` : Approuvé par admin
- `FUNDRAISING` : En collecte de fonds
- `COMPLETED` : Objectif atteint
- `REJECTED` : Refusé par admin

**Index** :
- PRIMARY KEY sur `id`
- INDEX sur `ownerWallet`
- INDEX sur `categoryId`
- INDEX sur `status`
- INDEX composite sur `(status, categoryId)`

**Relations** :
- `category` → Référence Category via `categoryId` → `id` (N:1, RESTRICT)
- `donations` → Un Project peut recevoir N Donations (1:N)
- `ownerWallet` : Simple string référençant User.walletAddress (pas de FK)

---

### 4. **donations** - Donations effectuées

Donations des utilisateurs vers les projets, vérifiées on-chain.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | UUID | PRIMARY KEY | Identifiant unique |
| **amount** | DECIMAL(18,4) | NOT NULL | Montant en ETH |
| **txHash** | STRING | UNIQUE, NOT NULL | Hash transaction blockchain |
| **verified** | BOOLEAN | NOT NULL, DEFAULT false | Transaction vérifiée on-chain |
| **verifiedAt** | TIMESTAMP | NULLABLE | Date de vérification |
| **blockNumber** | INTEGER | NULLABLE | Numéro de bloc |
| **donorWallet** | VARCHAR(42) | NOT NULL | Wallet donateur (référence simple) |
| **projectId** | INTEGER | FOREIGN KEY, NOT NULL | Projet bénéficiaire |
| **createdAt** | TIMESTAMP | NOT NULL, DEFAULT now() | Date de donation |

**Index** :
- PRIMARY KEY sur `id`
- UNIQUE sur `txHash`
- INDEX sur `donorWallet`
- INDEX sur `projectId`
- INDEX sur `txHash`
- INDEX sur `createdAt`

**Relations** :
- `project` → Référence Project via `projectId` → `id` (N:1, CASCADE)
- `donorWallet` : Simple string référençant User.walletAddress (pas de FK)

**Nouveauté : Vérification blockchain**
- `verified` : Indique si la transaction a été vérifiée on-chain
- `verifiedAt` : Timestamp de vérification
- `blockNumber` : Numéro de bloc pour traçabilité

---

### 5. **role_change_logs** - Audit des changements de rôles

Table d'audit pour traçabilité des modifications de rôles.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | UUID | PRIMARY KEY | Identifiant unique |
| **targetWallet** | VARCHAR(42) | NOT NULL | Wallet utilisateur modifié |
| **adminWallet** | VARCHAR(42) | NOT NULL | Wallet admin ayant modifié |
| **oldRole** | ENUM(UserRole) | NOT NULL | Ancien rôle |
| **newRole** | ENUM(UserRole) | NOT NULL | Nouveau rôle |
| **reason** | STRING | NULLABLE | Raison du changement |
| **timestamp** | TIMESTAMP | NOT NULL, DEFAULT now() | Date du changement |

**Index** :
- PRIMARY KEY sur `id`
- INDEX sur `targetWallet`
- INDEX sur `timestamp`

**Relations** :
- Aucune (table d'audit indépendante pour préserver l'historique)

---

## Relations et Cardinalités

**PRINCIPE FONDAMENTAL** : Pas de boucles circulaires. Les walletAddress sont des références simples, **pas des Foreign Keys**.

### Category ↔ Project
- **Type** : One-to-Many (1:N)
- **Clé étrangère** : `Project.categoryId` → `Category.id`
- **Cascade** : ON DELETE RESTRICT (empêche suppression catégorie avec projets)
- **Logique** : Une catégorie peut contenir plusieurs projets

### Project ↔ Donation
- **Type** : One-to-Many (1:N)
- **Clé étrangère** : `Donation.projectId` → `Project.id`
- **Cascade** : ON DELETE CASCADE (si projet supprimé, ses donations aussi)
- **Logique** : Un projet peut recevoir plusieurs donations

### Références vers User (sans FK)
**Ces champs sont de simples strings, pas des Foreign Keys** :
- `Project.ownerWallet` → Référence `User.walletAddress`
- `Project.approvedBy` → Référence `User.walletAddress`
- `Donation.donorWallet` → Référence `User.walletAddress`
- `RoleChangeLog.targetWallet` → Référence `User.walletAddress`
- `RoleChangeLog.adminWallet` → Référence `User.walletAddress`

**Pourquoi pas de FK vers User ?**
- ✅ Évite boucles circulaires (User → Project → Donation → User ❌)
- ✅ Cohérent avec blockchain (wallets = identités externes)
- ✅ Simplifie architecture et requêtes
- ⚠️ Intégrité référentielle à gérer dans le code applicatif

---

## Authentification - Système de Nonce

### Workflow d'authentification wallet

1. **Client** demande un nonce : `GET /auth/nonce?walletAddress=0x...`
2. **Backend** retourne le nonce stocké dans `User.nonce`
3. **Client** signe le message avec MetaMask : `Sign this nonce: {nonce}`
4. **Client** envoie signature : `POST /auth/verify { walletAddress, signature }`
5. **Backend** vérifie la signature avec ethers.js
6. **Backend** génère un nouveau nonce et retourne un JWT
7. **Client** stocke le JWT et l'utilise pour les requêtes protégées

### Champs d'authentification

- `nonce` : UUID unique régénéré après chaque connexion
- `isActive` : Permet de désactiver un compte sans le supprimer
- `lastLogin` : Traçabilité des connexions

---

## Système de Rôles et Permissions

### Rôles

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | - Approuver/rejeter projets<br>- Modifier rôles utilisateurs<br>- Accès complet à toutes les ressources |
| **ASSOCIATION** | - Créer des projets<br>- Modifier ses propres projets<br>- Voir ses donations reçues |
| **USER** | - Faire des donations<br>- Voir tous les projets publics<br>- Voir son historique de donations |

### Règles Métier

1. **Création de projet** : Seuls les ASSOCIATION peuvent créer
2. **Approbation** : Seuls les ADMIN peuvent approuver/rejeter
3. **Changement de rôle** : Seuls les ADMIN peuvent modifier
4. **Donation** : Tous les utilisateurs authentifiés (USER, ASSOCIATION, ADMIN)
5. **Validation wallets** : Vérifier existence dans User avant création Project/Donation
6. **Badges NFT et privilèges** :
   - Les utilisateurs gagnent des badges NFT via donations (géré par smart contract)
   - Les badges débloquent des privilèges additionnels (à définir dans l'application)
   - Ex: Badge Gold → Vote sur propositions, Badge Legendary → Accès early à nouveaux projets

---

## Indexes et Optimisations

### Indexes simples
- `users.walletAddress` : Authentification rapide
- `users.role` : Filtrage par rôle
- `categories.slug` : Recherche par URL
- `projects.status` : Filtrage projets actifs
- `donations.txHash` : Vérification unicité transaction
- `donations.createdAt` : Tri chronologique

### Indexes composites
- `projects(status, categoryId)` : Filtrage projets actifs par catégorie
- Permet des requêtes optimisées type : "Tous les projets FUNDRAISING dans la catégorie Health"

---

## Requêtes SQL Courantes

### Obtenir tous les projets en collecte avec leur catégorie et créateur
```sql
SELECT p.*, c.name as categoryName, c.icon, u.organizationName
FROM projects p
JOIN categories c ON p.categoryId = c.id
JOIN users u ON p.ownerWallet = u.walletAddress
WHERE p.status = 'FUNDRAISING'
ORDER BY p.createdAt DESC;
```

### Calculer le montant total collecté par projet (vérifier cohérence)
```sql
SELECT
  p.id,
  p.title,
  p.raised as raisedInDB,
  COALESCE(SUM(d.amount), 0) as raisedCalculated,
  p.raised - COALESCE(SUM(d.amount), 0) as difference
FROM projects p
LEFT JOIN donations d ON d.projectId = p.id AND d.verified = true
GROUP BY p.id, p.title, p.raised
HAVING p.raised != COALESCE(SUM(d.amount), 0);
```

### Top 10 donateurs
```sql
SELECT
  u.walletAddress,
  u.organizationName,
  COUNT(d.id) as donationCount,
  SUM(d.amount) as totalDonated
FROM users u
JOIN donations d ON d.donorWallet = u.walletAddress
WHERE d.verified = true
GROUP BY u.walletAddress, u.organizationName
ORDER BY totalDonated DESC
LIMIT 10;
```

### Projets par catégorie avec stats
```sql
SELECT
  c.name,
  c.icon,
  COUNT(p.id) as projectCount,
  SUM(p.raised) as totalRaised,
  AVG(p.raised / NULLIF(p.goal, 0) * 100) as avgCompletionRate
FROM categories c
LEFT JOIN projects p ON p.categoryId = c.id AND p.status IN ('FUNDRAISING', 'COMPLETED')
GROUP BY c.id, c.name, c.icon
ORDER BY projectCount DESC;
```

### Donations non vérifiées (à vérifier on-chain)
```sql
SELECT d.*, p.title, u.walletAddress
FROM donations d
JOIN projects p ON d.projectId = p.id
JOIN users u ON d.donorWallet = u.walletAddress
WHERE d.verified = false
ORDER BY d.createdAt ASC;
```

---

## Migration et Seed

### Appliquer le schéma
```bash
cd backend
npx prisma migrate dev --name add_auth_and_categories
npx prisma generate
```

### Seed des catégories
```bash
npx prisma db seed
```

### Configuration package.json
```json
{
  "prisma": {
    "seed": "ts-node src/prisma/seed.ts"
  }
}
```

---

## Améliorations Futures

### 1. Soft Deletes
```prisma
model User {
  deletedAt DateTime?
}
```

### 2. Updates de projets
```prisma
model ProjectUpdate {
  id        String   @id @default(uuid())
  projectId Int
  project   Project  @relation(fields: [projectId], references: [id])
  title     String
  content   String   @db.Text
  createdAt DateTime @default(now())
}
```

### 3. Commentaires
```prisma
model Comment {
  id        String   @id @default(uuid())
  projectId Int
  project   Project  @relation(fields: [projectId], references: [id])
  authorWallet String @db.VarChar(42)
  author    User     @relation(fields: [authorWallet], references: [walletAddress])
  content   String   @db.Text
  createdAt DateTime @default(now())
}
```

### 4. Sessions
```prisma
model Session {
  id           String   @id @default(uuid())
  userWallet   String   @db.VarChar(42)
  user         User     @relation(fields: [userWallet], references: [walletAddress])
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

---

## Points d'Attention

### Sécurité
- ✅ Nonce unique par connexion (anti-replay)
- ✅ Email unique (évite doublons)
- ✅ Wallet unique (1 compte par wallet)
- ✅ Vérification signature côté backend
- ⚠️ Implémenter rate limiting sur `/auth/*`
- ⚠️ Ajouter blacklist de tokens révoqués

### Performance
- ✅ Indexes sur clés étrangères
- ✅ Index composite pour requêtes fréquentes
- ✅ Cascade deletes configurés
- ⚠️ Pagination à implémenter (limit/offset)
- ⚠️ Cache Redis pour catégories (rarement modifiées)

### Intégrité
- ✅ ON DELETE CASCADE pour Donation → Project (si project supprimé)
- ✅ ON DELETE RESTRICT pour Project → Category (empêche suppression catégorie avec projets)
- ⚠️ Pas de FK vers User (wallets sont des références simples)
- ⚠️ Validation côté application pour vérifier existence des wallets
- ⚠️ Trigger SQL ou cron pour synchroniser `Project.raised`
- ⚠️ Webhook blockchain pour vérification auto des donations

---

**Version** : 2.0
**Date** : 2026-01-29
**Base de données** : PostgreSQL 16
**ORM** : Prisma 7.3.0
