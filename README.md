# Calypso

Phase 2.1 foundation for a modular monolith Web3 game asset backend.

## Included in Phase 2

- Node.js + TypeScript project setup
- Fastify server with `GET /health`
- OpenAPI docs via Swagger at `/docs`
- Linting with ESLint
- Formatting with Prettier
- Basic API test with Vitest
- Environment template via `.env.example`
- PostgreSQL data model with Prisma
- Player CRUD APIs
- Asset CRUD APIs
- Initial Prisma migration files

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
```

## Environment

Copy `.env.example` values into your local environment as needed.
If `DATABASE_URL` is not set, the app defaults to `file:./prisma/dev.db`.

## Local PostgreSQL

```bash
docker compose up -d
```

## Player APIs

- `POST /players`
- `GET /players`
- `GET /players/:id`
- `PUT /players/:id`
- `DELETE /players/:id`

## Asset APIs

- `POST /assets`
- `GET /assets`
- `GET /assets/:id`
- `PUT /assets/:id`
- `DELETE /assets/:id`
