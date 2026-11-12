@echo off
setlocal
if not exist .env copy .env.example .env
call npm install
call docker compose up -d postgres
call npm run db:generate
call npm run db:migrate
call npm run db:seed
call npm run dev
