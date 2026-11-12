if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
