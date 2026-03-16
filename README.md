# CRRAE-UMOA CRM Backend

API REST NestJS pour le CRM CRRAE-UMOA.

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (requires PostgreSQL running)
npx prisma migrate dev --name init

# Seed demo data
npm run seed

# Start development server
npm run start:dev
```

## Auth

POST `/auth/login` with `{ "email": "admin@crrae-umoa.org", "password": "crrae2026" }`

All other routes require `Authorization: Bearer <token>` header.

## Modules

- `GET/POST /contacts` — Contacts
- `GET/POST /deals` — Opportunités
- `GET/POST /activities` — Activités
- `GET/POST /tickets` — Tickets support
- `GET/POST /surveys` — Enquêtes satisfaction
- `GET/POST /campaigns` — Campagnes marketing
- `GET/POST /events` — Événements
- `GET/POST /contracts` — Contrats
- `GET/POST /workflows` — Automatisations
- `GET/POST /users` — Utilisateurs

Each supports `GET/:id`, `PUT/:id`, `DELETE/:id`.
