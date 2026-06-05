# UNO Online

Multiplayer UNO-inspired web application built with TypeScript, Express, PostgreSQL, and Server-Sent Events for live game synchronization.

**Live Demo:** [uno-9ctx.onrender.com](https://uno-9ctx.onrender.com)

## Overview

UNO Online is a full-stack browser game that recreates the core multiplayer UNO experience with real-time turn updates, account-based sessions, lobby management, and persistent game state.

This project demonstrates end-to-end product work across backend architecture, game-state modeling, database design, server-rendered UI, and frontend interaction logic.

## Highlights

- Real-time multiplayer gameplay using Server-Sent Events
- Secure authentication flow with registration, login, and session persistence
- Lobby system for creating and joining live matches
- Turn-based game engine with draw penalties, reverses, skips, wild cards, and UNO callouts
- PostgreSQL-backed persistence for users, games, sessions, and cards
- Custom card asset pipeline and polished in-browser game table UI
- Deployed production version on Render

## What This Project Demonstrates

- Building and shipping a complete full-stack product from database to UI
- Modeling non-trivial game rules and shared multiplayer state on the server
- Keeping multiple clients synchronized in near real time
- Structuring a TypeScript Node.js application with clear route, database, and client layers
- Deploying a stateful web application with a managed Postgres database

## Tech Stack

- TypeScript
- Node.js
- Express
- EJS
- PostgreSQL
- `pg-promise`
- `express-session`
- `connect-pg-simple`
- Server-Sent Events (SSE)
- `node-pg-migrate`
- esbuild
- ESLint

## Core Features

### Authentication and Sessions

- User registration and login
- Password hashing with bcrypt
- PostgreSQL-backed session storage

### Lobby and Match Flow

- Create a new game from the lobby
- Join existing games
- Track player counts and match state

### Gameplay

- Draw deck and discard pile state
- Turn rotation and direction changes
- Action cards including skip, reverse, draw two, wild, and wild draw four
- UNO and catch-UNO mechanics
- Live updates pushed to connected players during gameplay

## Architecture

```text
src/
  client/       Frontend TypeScript for lobby and gameplay interactions
  db/           Database access and game logic
  middleware/   Express middleware
  routes/       Auth, lobby, gameplay, and SSE endpoints
  types/        Shared TypeScript types
views/          EJS templates
public/         Static assets and generated card images
migrations/     Database schema and seed migrations
scripts/        Utility scripts such as card asset generation
```

## Deployment

The application is deployed on Render and uses PostgreSQL for persistent storage.

Live site:
[https://uno-9ctx.onrender.com](https://uno-9ctx.onrender.com)

## Notes

- This repository represents an independently maintained and deployed version of the project.
- The card visuals in this repo are original project assets created for this implementation.
