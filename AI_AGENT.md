# Calypso — AI Agent Development Guide

## 1. Project Overview

**Project Name:** Calypso
**Project Type:** Web3 Game Asset Backend
**Primary Purpose:** Backend and blockchain integration showcase

Calypso is a small, production-style backend application demonstrating how a game backend can integrate with an EVM-compatible blockchain.

The project is intended as a **Software Architect / Backend Engineer portfolio project**, with particular relevance to Web3 gaming companies looking for experience with:

* Node.js
* TypeScript
* REST APIs
* Backend architecture
* PostgreSQL
* Blockchain integration
* ethers.js
* EVM
* Solidity
* NFT / digital assets
* Wallet integration
* Blockchain transaction processing

The project should remain intentionally simple.

The goal is **not** to build a complete game or a complex enterprise platform.

---

# 2. Primary Use Case

Calypso provides a backend API for a hypothetical Web3 game.

The game has players who can associate an EVM wallet with their account and own digital game assets.

Game assets can be represented as NFTs on an EVM blockchain.

The backend provides:

1. Player management
2. Wallet association
3. Game asset management
4. NFT minting
5. Blockchain transaction tracking
6. NFT ownership lookup
7. Blockchain event processing
8. Optional reconciliation between database and blockchain

---

# 3. Target Architecture

Use a **Modular Monolith**.

Do NOT create microservices.

```text
                    Game Client
                  Swagger / REST
                        |
                        v
              +---------------------+
              |   Calypso Backend   |
              | Node.js + TypeScript|
              +----------+----------+
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      Player          Asset        Transaction
      Module          Module          Module
          |              |              |
          +--------------+--------------+
                         |
                         v
                    PostgreSQL
                         |
                         |
                  Blockchain Module
                         |
                      ethers.js
                         |
                         v
                  EVM Blockchain
                         |
                         v
                  GameAsset.sol
```

The backend is one deployable application.

---

# 4. Technology Stack

Use the following stack unless there is a strong technical reason not to.

## Backend

* Node.js
* TypeScript
* Fastify
* REST
* OpenAPI / Swagger

## Database

* PostgreSQL
* Prisma ORM

## Blockchain

* Solidity
* ERC-721
* OpenZeppelin
* ethers.js
* Local EVM blockchain during development

## Testing

* Vitest
* API integration tests
* Smart contract tests

## Development

* npm
* Git
* VS Code
* Docker only where useful

---

# 5. Infrastructure Constraints

Keep infrastructure minimal.

Required:

* One Node.js application
* One PostgreSQL database
* One local EVM blockchain

Optional:

* Docker Compose

Do NOT introduce:

* Kubernetes
* Kafka
* Redis
* AWS
* GCP
* API Gateway
* Service mesh
* Microservices
* Message brokers
* Event streaming platforms
* Complex CI/CD
* React
* Unity
* Unreal Engine

These technologies are outside the MVP scope.

The project should be runnable locally with minimal setup.

---

# 6. Domain Model

The initial domain consists of four major concepts.

## Player

Represents a game player.

Fields:

```text
id
username
createdAt
```

## Wallet

Represents an EVM wallet associated with a player.

Fields:

```text
id
playerId
address
createdAt
```

A player may have one wallet in the MVP.

## Asset

Represents a game asset.

Examples:

```text
Dragon Sword
Magic Shield
Golden Armor
Fire Staff
```

Fields:

```text
id
name
description
assetType
metadataUri
createdAt
```

## Blockchain Transaction

Represents a blockchain operation initiated by Calypso.

Fields:

```text
id
assetId
walletAddress
operation
txHash
status
tokenId
createdAt
confirmedAt
```

Possible statuses:

```text
PENDING
CONFIRMED
FAILED
```

Possible operations:

```text
MINT
TRANSFER
```

---

# 7. REST API

Implement these APIs incrementally.

## Health

```http
GET /health
```

Expected response:

```json
{
  "status": "UP",
  "service": "calypso"
}
```

---

## Player

```http
POST /players
GET /players/{id}
```

Example:

```json
{
  "username": "wied"
}
```

---

## Wallet

```http
POST /players/{id}/wallet
GET /players/{id}/wallet
```

Example:

```json
{
  "address": "0x123..."
}
```

The wallet address must be validated as a valid EVM address.

---

## Asset

```http
POST /assets
GET /assets
GET /assets/{id}
```

Example:

```json
{
  "name": "Dragon Sword",
  "description": "A legendary sword",
  "assetType": "WEAPON",
  "metadataUri": "ipfs://..."
}
```

---

## Mint NFT

This is the primary blockchain use case.

```http
POST /assets/{id}/mint
```

The backend should:

1. Validate the asset
2. Find the associated player wallet
3. Create a blockchain transaction record
4. Call the NFT smart contract using ethers.js
5. Capture the transaction hash
6. Wait for transaction confirmation
7. Extract the token ID
8. Update the transaction record
9. Return the result

Example response:

```json
{
  "assetId": "asset-123",
  "tokenId": 101,
  "txHash": "0xabc...",
  "status": "CONFIRMED"
}
```

---

## Player Assets

```http
GET /players/{id}/assets
```

Return the player's game assets and associated NFT information.

---

## Transaction

```http
GET /transactions/{id}
```

Example:

```json
{
  "id": "tx-123",
  "operation": "MINT",
  "txHash": "0xabc...",
  "tokenId": 101,
  "status": "CONFIRMED"
}
```

---

# 8. Smart Contract

Create:

```text
contracts/GameAsset.sol
```

The contract should implement ERC-721 using OpenZeppelin.

Required capabilities:

```text
mint()
ownerOf()
transferFrom()
```

Required events:

```text
AssetMinted
AssetTransferred
```

Keep the contract simple.

Do not implement token economics, staking, marketplace functionality, DAO functionality, or complicated game mechanics.

---

# 9. Blockchain Integration

Create a dedicated blockchain module.

Suggested structure:

```text
src/
├── blockchain/
│   ├── blockchain.service.ts
│   ├── nft.service.ts
│   └── contract.ts
```

The blockchain layer is responsible for:

* Connecting to the EVM provider
* Loading the contract
* Submitting transactions
* Reading blockchain state
* Waiting for confirmations
* Handling transaction errors

Business modules should not directly use ethers.js.

For example:

```text
AssetService
     |
     v
BlockchainService
     |
     v
ethers.js
     |
     v
GameAsset.sol
```

This separation is important.

---

# 10. Transaction Lifecycle

Blockchain transactions must be treated as asynchronous operations.

Target lifecycle:

```text
REQUESTED
    |
    v
PENDING
    |
    v
CONFIRMED
```

Failure:

```text
PENDING
    |
    v
FAILED
```

The database should store the blockchain transaction hash.

Do not assume that submitting a transaction means it has been confirmed.

---

# 11. Blockchain Ownership

Calypso should be able to query the blockchain to determine NFT ownership.

Example:

```text
GET /assets/{id}/owner
```

The service should ultimately call:

```text
ownerOf(tokenId)
```

through ethers.js.

The blockchain is the authoritative source for NFT ownership.

---

# 12. Blockchain Event Listener

After the MVP is working, implement a simple blockchain event listener.

Listen for:

```text
AssetMinted
AssetTransferred
```

The listener should update the local database when appropriate.

Do not introduce Kafka.

The listener can run inside the same Node.js application.

---

# 13. Reconciliation

This is an optional advanced feature.

Calypso should be able to compare:

```text
Database ownership
        vs
Blockchain ownership
```

Example:

```text
Database:
NFT #101 -> Player A

Blockchain:
NFT #101 -> Player B

Result:
OWNERSHIP_MISMATCH
```

Create a simple reconciliation service.

Do not build a complicated scheduling platform.

A manual API endpoint is sufficient for the showcase.

For example:

```http
POST /reconciliation/assets/{id}
```

---

# 14. Security Requirements

Implement basic security practices.

## Input validation

Validate:

* UUIDs/IDs
* usernames
* asset fields
* EVM wallet addresses
* request bodies

## Wallet validation

Reject malformed wallet addresses.

## Configuration

Never hard-code:

* private keys
* RPC URLs
* database passwords
* secrets

Use environment variables.

Example:

```text
DATABASE_URL
BLOCKCHAIN_RPC_URL
BLOCKCHAIN_PRIVATE_KEY
NFT_CONTRACT_ADDRESS
```

Never commit `.env`.

Provide:

```text
.env.example
```

with placeholder values.

---

# 15. Error Handling

Use consistent REST error responses.

Example:

```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset was not found"
  }
}
```

Examples:

```text
PLAYER_NOT_FOUND
WALLET_NOT_FOUND
ASSET_NOT_FOUND
INVALID_WALLET_ADDRESS
TRANSACTION_FAILED
BLOCKCHAIN_UNAVAILABLE
```

Do not expose private keys, internal stack traces, or sensitive infrastructure information.

---

# 16. Project Structure

Prefer this structure:

```text
calypso-web3/
│
├── src/
│   ├── player/
│   │   ├── player.controller.ts
│   │   ├── player.service.ts
│   │   └── player.repository.ts
│   │
│   ├── wallet/
│   │   ├── wallet.controller.ts
│   │   ├── wallet.service.ts
│   │   └── wallet.repository.ts
│   │
│   ├── asset/
│   │   ├── asset.controller.ts
│   │   ├── asset.service.ts
│   │   └── asset.repository.ts
│   │
│   ├── transaction/
│   │   ├── transaction.controller.ts
│   │   ├── transaction.service.ts
│   │   └── transaction.repository.ts
│   │
│   ├── blockchain/
│   │   ├── blockchain.service.ts
│   │   ├── nft.service.ts
│   │   └── contract.ts
│   │
│   ├── reconciliation/
│   │   └── reconciliation.service.ts
│   │
│   ├── config/
│   ├── shared/
│   └── app.ts
│
├── contracts/
│   └── GameAsset.sol
│
├── prisma/
│   └── schema.prisma
│
├── test/
│
├── docs/
│
├── .env.example
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

Adjust the structure if the implementation framework requires it, but preserve modular boundaries.

---

# 17. Development Phases

The AI agent must implement the project incrementally.

Do not attempt to implement the entire project in one step.

## Phase 1 — Project Foundation

Implement:

* Node.js
* TypeScript
* Fastify
* project structure
* configuration
* `/health`
* linting
* formatting
* basic tests

Definition of done:

```text
npm test
npm run build
npm run dev
```

all work.

---

## Phase 2 — Database

Implement:

* PostgreSQL
* Prisma
* migrations
* Player
* Wallet
* Asset
* BlockchainTransaction

Implement CRUD APIs for Player and Asset.

---

## Phase 3 — Wallet

Implement:

```text
POST /players/{id}/wallet
GET /players/{id}/wallet
```

Validate EVM addresses.

---

## Phase 4 — Smart Contract

Implement:

* Hardhat or Foundry
* OpenZeppelin
* ERC-721 contract
* mint
* transfer
* ownerOf
* events

Deploy to local EVM.

---

## Phase 5 — ethers.js Integration

Implement:

```text
BlockchainService
NFTService
```

Connect the backend to the local EVM.

Implement:

```text
POST /assets/{id}/mint
```

This is the first major Web3 milestone.

---

## Phase 6 — Transaction Tracking

Implement:

* transaction persistence
* txHash
* status
* confirmation
* failure handling

Implement:

```text
GET /transactions/{id}
```

---

## Phase 7 — Ownership

Implement:

```text
GET /players/{id}/assets
GET /assets/{id}/owner
```

Use the blockchain for authoritative NFT ownership.

---

## Phase 8 — Event Listener

Implement listeners for:

```text
AssetMinted
AssetTransferred
```

Update local state accordingly.

---

## Phase 9 — Reconciliation

Implement optional database/blockchain ownership reconciliation.

---

## Phase 10 — Testnet

Only after local development is stable, deploy the contract to an EVM testnet such as Polygon Amoy.

The application should support switching between:

```text
LOCAL
TESTNET
```

through configuration.

---

# 18. Testing Strategy

Prioritize tests around business logic.

## Unit tests

Test:

* PlayerService
* WalletService
* AssetService
* TransactionService
* ReconciliationService

## API tests

Test:

```text
POST /players
POST /players/{id}/wallet
POST /assets
GET /assets/{id}
POST /assets/{id}/mint
GET /transactions/{id}
GET /players/{id}/assets
```

## Smart contract tests

Test:

```text
mint
ownerOf
transfer
events
```

Test failure cases as well as successful cases.

---

# 19. Architecture Principles

Apply these principles:

### Modular Monolith

Keep domain boundaries clear without introducing microservices.

### Separation of Concerns

Controllers handle HTTP.

Services handle business logic.

Repositories handle persistence.

Blockchain services handle ethers.js/blockchain interaction.

### Dependency Direction

Business logic should depend on abstractions where practical.

Avoid spreading ethers.js calls throughout the application.

### Idempotency

Blockchain operations should consider duplicate requests.

Do not accidentally mint the same requested asset multiple times because of a repeated API request.

### Eventual Consistency

Recognize that:

```text
Backend
   |
   v
Blockchain transaction
   |
   v
Confirmation
```

is asynchronous.

Do not assume immediate blockchain finality.

### Blockchain as Ownership Authority

For NFT ownership:

```text
Blockchain > local database
```

The database is an application-side representation/cache.

---

# 20. What NOT to Build

Do not expand scope without explicit approval.

Do NOT build:

* Full game
* Unity client
* Unreal client
* Marketplace
* Token economy
* Cryptocurrency
* DAO
* Staking
* NFT marketplace
* Cross-chain bridge
* DeFi
* Smart contract upgrade framework
* Kubernetes
* Kafka
* Redis
* Microservices
* AWS infrastructure
* Complex authentication platform

The purpose of Calypso is to demonstrate **backend + Web3 integration**, not to create a commercial game.

---

# 21. Coding Guidelines for the AI Agent

When implementing code:

1. Prefer simple, readable TypeScript.
2. Use strict TypeScript settings.
3. Avoid unnecessary abstractions.
4. Avoid premature optimization.
5. Keep modules cohesive.
6. Keep dependencies minimal.
7. Use async/await.
8. Handle errors explicitly.
9. Validate external input.
10. Never hard-code secrets.
11. Write tests alongside important functionality.
12. Update documentation when architecture changes.
13. Do not introduce new infrastructure without justification.
14. Prefer a simple solution over a clever solution.
15. Do not rewrite working code unnecessarily.

---

# 22. AI Agent Working Rules

The AI agent should work **one phase at a time**.

Before implementing a phase:

1. Inspect the existing project.
2. Understand what has already been implemented.
3. Check the current architecture.
4. Identify the smallest implementation required.
5. Implement the change.
6. Run tests.
7. Run TypeScript compilation.
8. Fix errors.
9. Update documentation if necessary.
10. Summarize what was changed.

Do not implement future phases prematurely.

Do not introduce infrastructure simply because it might be useful later.

If a requirement is ambiguous, prefer the simplest implementation consistent with this document.

---

# 23. Definition of Done

Calypso MVP is complete when the following scenario works end-to-end:

```text
1. Create player
       |
       v
2. Associate EVM wallet
       |
       v
3. Create game asset
       |
       v
4. Mint NFT
       |
       v
5. Backend submits blockchain transaction
       |
       v
6. Transaction is confirmed
       |
       v
7. Database stores txHash + tokenId
       |
       v
8. Query player's assets
       |
       v
9. Verify NFT ownership on blockchain
```

The complete flow must work against a local EVM blockchain.

---

# 24. Portfolio Objective

The final project should allow the developer to demonstrate:

> "I designed and implemented a modular Node.js/TypeScript backend that integrates a Web3 game asset domain with an EVM blockchain. The system manages players and wallets, mints ERC-721 digital assets through ethers.js, tracks blockchain transactions, processes blockchain events, and reconciles application state with on-chain ownership."

This statement represents the primary purpose of the project.

Do not optimize the project for feature count.

Optimize for:

* Clean architecture
* Working blockchain integration
* Good backend engineering
* Clear domain modeling
* Testability
* Understandable code
* Strong documentation
* Interview discussion value
