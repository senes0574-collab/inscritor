# Inscritor

Système d'inscription des étudiants et de gestion des paiements (Next.js + PostgreSQL + Drizzle ORM).

## Démarrage

```bash
npm install
cp .env.example .env   # puis adapter DATABASE_URL
npx drizzle-kit push   # crée les tables
npm run dev
```

## Scripts

- `npm run dev` : serveur de développement
- `npm run build` / `npm start` : build et production
- `npm run lint` / `npm run typecheck`

## Déploiement

Variable requise : `DATABASE_URL` (PostgreSQL).
