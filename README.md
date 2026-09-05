# Calypso — Web3 Game Asset Backend

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
│   ├── player/                  # Player module (Controller, Service, Repository)
│   ├── wallet/                  # Wallet module (Controller, Service, Repository)
│   ├── config/                  # Environment & Prisma client configuration
│   ├── shared/                  # Centralized app errors & utilities
│   ├── app.ts                   # Fastify application factory & error handler
│   └── server.ts                # Server bootstrap entry point
├── test/
│   ├── contracts/               # Hardhat smart contract tests
│   ├── helpers/                 # Test database utilities
│   ├── health.test.ts           # Health endpoint unit test
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

### Wallet Association

- `POST /players/:id/wallet` — Associate or update EVM wallet address for a player (validated via `ethers.js`)
- `GET /players/:id/wallet` — Get player's associated EVM wallet

### Asset Management

- `POST /assets` — Create a new game asset (Weapon, Armor, Accessory, Consumable)
- `GET /assets` — List all game assets
- `GET /assets/:id` — Get asset details by ID
- `PUT /assets/:id` — Update asset metadata
- `DELETE /assets/:id` — Delete an asset

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
