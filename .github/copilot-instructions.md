# Binance Trading Bot — Copilot Instructions

> Part of the CooperDev Software Factory. Maintenance mode — only bug fixes and critical security patches. No new features without explicit approval.

## What this project is
Automated crypto trading bot using trailing buy/sell grid strategy on Binance. Monitors symbols per second, uses trailing stop-loss orders. Deployed on Raspberry Pi and Linux servers.

## Stack
- **Runtime**: Node.js / JavaScript (no TypeScript)
- **DB**: MongoDB 3.2.20 (legacy version for RPi 32bit compatibility)
- **Cache**: Redis
- **Frontend**: Webpack-bundled admin UI
- **Tests**: Jest
- **Build**: Webpack (webpack.config.prod.js) + Grunt (Gruntfile.js)

## Status: MAINTENANCE MODE
This project is in maintenance mode. Changes are restricted to:
1. Security patches (CVEs in dependencies)
2. Critical bug fixes (data loss, incorrect trade execution)
3. Configuration and deployment improvements

## Critical Rules

### Financial Safety
- Any change to buy/sell logic MUST have a test that simulates the outcome
- Never modify `lastBuyPrice` persistence without preserving backwards compatibility
- Price calculations: always use string arithmetic or precise number handling — never `Number` floating point for financial math

### MongoDB Compatibility
Target MongoDB 3.2.20 (RPi constraint). Do NOT use aggregation features or operators introduced after 3.2.

### Configuration Immutability
Grid trade configuration stored in MongoDB. If schema changes, write a migration in `migrations/`. Never change field names without migration.

### State Storage
`mongo-state-storage.js` is the single source of truth for bot state. Do not add alternative state stores.

## What NOT to do
- Do not add new trading strategies without architecture review
- Do not upgrade MongoDB driver beyond RPi 32bit compatible version without testing
- Do not add real-money trading features without extensive paper-trading validation
- Do not remove the disclaimer / warning system in the frontend
