# Calypso

Phase 4 Web3 game asset backend with ERC-721 Smart Contract setup.

## Included Features

- Node.js + TypeScript project setup
- Fastify server with `GET /health`
- OpenAPI docs via Swagger at `/docs`
- Linting with ESLint & formatting with Prettier
- Vitest unit and integration test suite
- SQLite / PostgreSQL data model with Prisma
- Player CRUD APIs
- Asset CRUD APIs
- Wallet association APIs with EVM address validation via ethers.js
- OpenZeppelin ERC-721 Smart Contract (`GameAsset.sol`) with minting, transfer, and event capabilities
- Hardhat environment setup for compilation, testing, and local deployment

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
npm run format:check
npm run prisma:generate
npm run prisma:migrate
npm run compile
npm run test:contracts
npm run deploy:local
```

## Environment

Copy `.env.example` values into your local environment as needed.
If `DATABASE_URL` is not set, the app defaults to `file:./prisma/dev.db`.

## Local Database (SQLite)

No container is required. Prisma will create `prisma/dev.db` automatically when migrations run.

Run:

```bash
npm run prisma:migrate
```

## Player APIs

- `POST /players`
- `GET /players`
- `GET /players/:id`
- `PUT /players/:id`
- `DELETE /players/:id`

## Wallet APIs

- `POST /players/:id/wallet`
- `GET /players/:id/wallet`

## Asset APIs

- `POST /assets`
- `GET /assets`
- `GET /assets/:id`
- `PUT /assets/:id`
- `DELETE /assets/:id`
