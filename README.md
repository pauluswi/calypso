# Calypso — Web3 Game Asset Backend

![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.6-000000?style=flat-square&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity&logoColor=white)
![ethers.js](https://img.shields.io/badge/ethers.js-6.17-245C6A?style=flat-square)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-FFF100?style=flat-square&logo=ethereum&logoColor=black)
![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?style=flat-square&logo=vitest&logoColor=white)

Calypso is a production-style, modular monolith backend application demonstrating how a Web3 game backend integrates with an EVM-compatible blockchain.

It provides REST APIs for player management, EVM wallet association, game asset management, and an ERC-721 smart contract setup for digital game assets.

---

## Architecture & Technology Stack

- **Architecture:** Modular Monolith
- **Backend:** Node.js, TypeScript, Fastify, OpenAPI / Swagger
- **Database:** Prisma ORM, SQLite (local development zero-config) / PostgreSQL ready
- **Blockchain:** Solidity, OpenZeppelin (ERC-721), Hardhat, ethers.js
- **Testing:** Vitest (API & Unit tests), Hardhat / Chai (Smart Contract tests)
- **Tooling:** ESLint, Prettier, tsx

---

## Implemented Phases Summary

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1 — Project Foundation** | Fastify, TypeScript, OpenAPI (`/docs`), `/health`, ESLint, Prettier, Vitest setup | Completed |
| **Phase 2 — Database & Domain** | Prisma ORM, data model (`Player`, `Wallet`, `Asset`, `BlockchainTransaction`), Player CRUD, Asset CRUD | Completed |
| **Phase 3 — Wallet Association** | Player EVM wallet association (`POST /players/:id/wallet`, `GET /players/:id/wallet`), EVM address validation via `ethers.js` | Completed |
| **Phase 4 — Smart Contract** | `GameAsset.sol` (ERC-721), Hardhat compilation, contract unit test suite, deployment script | Completed |
| **Phase 5 — ethers.js Integration** | `BlockchainService`, `NFTService`, contract ABI integration, NFT minting API (`POST /assets/:id/mint`) | Completed |
| **Phase 6 — Transaction Tracking** | Transaction persistence, status updates (`PENDING` $\rightarrow$ `CONFIRMED` / `FAILED`), transaction lookup API (`GET /transactions/:id`) | Completed |
| **Phase 7 — Ownership Lookup** | Player asset list API (`GET /players/:id/assets`), blockchain authoritative ownership API (`GET /assets/:id/owner`) | Completed |
| **Phase 8 — Event Listener** | Listen for contract events (`AssetMinted`, `AssetTransferred`) and update database state | Pending |
| **Phase 9 — Reconciliation** | Ownership reconciliation service (`POST /reconciliation/assets/:id`) comparing DB vs. Blockchain | Pending |
| **Phase 10 — Testnet Support** | Network switching support between local EVM and EVM testnet (e.g. Polygon Amoy) | Pending |

---

## Project Structure

```text
calypso/
├── contracts/
│   └── GameAsset.sol            # OpenZeppelin ERC-721 smart contract
├── prisma/
│   ├── migrations/              # Database migration history
│   ├── schema.prisma            # Data model definitions
│   └── seed.ts                  # Database seeding script
├── scripts/
│   └── deploy.ts                # Hardhat smart contract deployment script
├── src/
│   ├── asset/                   # Asset module (Controller, Service, Repository)
│   ├── blockchain/              # Blockchain module (BlockchainService, NFTService, contract ABI)
│   ├── player/                  # Player module (Controller, Service, Repository)
│   ├── transaction/             # Blockchain Transaction module (Service, Repository)
│   ├── wallet/                  # Wallet module (Controller, Service, Repository)
│   ├── config/                  # Environment & Prisma client configuration
│   ├── shared/                  # Centralized app errors & utilities
│   ├── app.ts                   # Fastify application factory & error handler
│   └── server.ts                # Server bootstrap entry point
├── test/
│   ├── contracts/               # Hardhat smart contract tests
│   ├── helpers/                 # Test database utilities
│   ├── health.test.ts           # Health endpoint unit test
│   ├── mint.test.ts             # NFT minting integration test
│   ├── ownership.test.ts        # Ownership lookup integration test
│   ├── transaction.test.ts      # Transaction lookup integration test
│   ├── wallet.test.ts           # Wallet integration test
│   └── player-asset-crud.integration.test.ts # Player & Asset CRUD integration tests
├── .env.example
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

---

## Quickstart & Development Commands

### Prerequisites

- Node.js (>= 20.0.0)
- npm

### Installation & Database Setup

```bash
# Install dependencies
npm install

# Run database migrations (creates prisma/dev.db automatically)
npm run prisma:migrate

# Seed sample data (optional)
npm run prisma:seed
```

### Running the Application

```bash
# Start development server with hot-reload
npm run dev

# Open API Documentation (Swagger UI)
# http://localhost:3000/docs
```

### Building & Testing

```bash
# Typecheck & Build TypeScript code
npm run build

# Run backend unit & integration tests (Vitest)
npm test

# Compile Solidity smart contracts
npm run compile

# Run smart contract unit tests (Hardhat)
npm run test:contracts

# Deploy smart contract locally
npm run deploy:local

# Linting & Formatting
npm run lint
npm run format:check
```

---

## API Summary

### System Health

- `GET /health` — Service health check
- `GET /docs` — Interactive OpenAPI / Swagger UI

### Player Management

- `POST /players` — Create a new player
- `GET /players` — List all players
- `GET /players/:id` — Get player details by ID
- `PUT /players/:id` — Update player username
- `DELETE /players/:id` — Delete a player
- `GET /players/:id/assets` — Get player's game assets and associated NFT information

### Wallet Association

- `POST /players/:id/wallet` — Associate or update EVM wallet address for a player (validated via `ethers.js`)
- `GET /players/:id/wallet` — Get player's associated EVM wallet

### Asset Management

- `POST /assets` — Create a new game asset (Weapon, Armor, Accessory, Consumable)
- `GET /assets` — List all game assets
- `GET /assets/:id` — Get asset details by ID
- `PUT /assets/:id` — Update asset metadata
- `DELETE /assets/:id` — Delete an asset
- `POST /assets/:id/mint` — Mint game asset as an NFT on EVM blockchain to a player's wallet
- `GET /assets/:id/owner` — Query EVM blockchain for authoritative NFT ownership (`ownerOf`)

### Transaction Tracking

- `GET /transactions/:id` — Get status and details of a blockchain transaction (`PENDING`, `CONFIRMED`, `FAILED`)

---

## Smart Contract

`GameAsset.sol` (`contracts/GameAsset.sol`)

- **Standard:** ERC-721 (OpenZeppelin v5)
- **Name / Symbol:** `GameAsset` / `GA`
- **Functions:**
  - `mint(address to)` — Mints next sequential `tokenId` (restricted to contract owner).
  - `transferAsset(address from, address to, uint256 tokenId)` — Transfers token and emits custom `AssetTransferred` event.
  - `ownerOf(uint256 tokenId)` — Returns owner of given token.
- **Events:**
  - `AssetMinted(address indexed to, uint256 indexed tokenId)`
  - `AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId)`
