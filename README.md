# UNO Online

UNO Online is a full-stack web application that brings the classic card game to the browser with account-based access, multiplayer game management, and live game-state updates.

Built as a TypeScript/Node.js project, the application uses Express for the server layer, EJS for rendering views, PostgreSQL for persistence, and Server-Sent Events (SSE) to keep players synchronized during gameplay.

## Features

- User registration and login
- Persistent session management with PostgreSQL-backed sessions
- Lobby flow for creating and joining games
- Browser-based UNO gameplay
- Real-time game updates using SSE
- Database migrations for schema management

## Tech Stack

- TypeScript
- Node.js
- Express
- EJS
- PostgreSQL
- `node-pg-migrate`
- ESLint and Prettier

## Project Structure

```text
src/
  client/       Frontend TypeScript for lobby and gameplay interactions
  db/           Database access and game logic helpers
  middleware/   Express middleware
  routes/       Route handlers for auth, lobby, gameplay, and SSE
  types/        Shared TypeScript types
views/          EJS templates
public/         Static assets
migrations/     Database migration files
```

## Notes

- This repository is maintained as an independent copy for personal development and deployment.
- Review environment variables and deployment settings before publishing or connecting the project to production services.
