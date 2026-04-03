# Binance Trading Bot — Agents, Workers & Services

Este arquivo documenta os agentes, workers e serviços autônomos do bot de trading.

**Stack**: Node.js | MongoDB + Redis
**Status**: MANUTENÇÃO — Não adicionar features novas sem aprovação
**Trading**: Trailing trade strategy com TradingView indicators
**Safety**: NUNCA modificar lógica de ordens sem testes extensivos

---

## Main Services

### 1. Trading Bot Server
- **Arquivo**: `app/server.js`
- **Tipo**: service (principal)
- **Responsabilidade**: Orquestrar todos os módulos — WebSocket streams, cron jobs, frontend

### 2. Binance WebSocket Streams
- **Tipo**: service (real-time)
- **Responsabilidade**: Conexões WebSocket com Binance para dados de mercado
- **Arquivos**:
  - `app/binance/candles.js` — Kline candlestick data
  - `app/binance/ath-candles.js` — All-Time-High tracking
  - `app/binance/tickers.js` — Real-time tickers
  - `app/binance/orders.js` — Order synchronization
  - `app/binance/user.js` — User account events
- **Setup**: `app/server-binance.js`

### 3. Cron Job Scheduler
- **Tipo**: cron
- **Responsabilidade**: Executar estratégias de trading em intervalos regulares.
- **Arquivo**: `app/server-cronjob.js`, `app/cronjob/index.js`

### 4. Trailing Trade Strategy
- **Tipo**: worker/strategy
- **Responsabilidade**: Executar a lógica principal de trading — análise de indicadores, decisões de compra/venda, gestão de posições.
- **Diretório**: `app/cronjob/trailingTrade/`
- **Steps** (40+ arquivos em `step/`):
  - get-balances.js, get-symbol-configuration.js, get-override-action.js
  - ensure-manual-order.js, save-data-to-cache.js, remove-last-buy-price.js
  - (e 34+ outros passos da estratégia)

### 5. TradingView Indicator Service
- **Tipo**: external service (Python)
- **Responsabilidade**: Análise técnica com indicadores TradingView.
- **Diretório**: `app/cronjob/trailingTradeIndicator/`
- **Docker**: Serviço `tradingview` (Python, porta 8082)

### 6. Web Frontend
- **Tipo**: service
- **Responsabilidade**: Interface web de monitoramento e configuração.
- **Arquivo**: `app/server-frontend.js`
- **Porta**: 8080
- **Assets**: `public/`

---

## Infrastructure Helpers

| Helper | Arquivo | Função |
|--------|---------|--------|
| Logger | `app/helpers/logger.js` | Bunyan logging |
| Cache | `app/helpers/cache.js` | Redis wrapper (ioredis) |
| MongoDB | `app/helpers/mongo.js` | Connection + collections |
| Binance API | `app/helpers/binance.js` | binance-api-node wrapper |
| PubSub | `app/helpers/pubsub.js` | PubSubJS events |
| Slack | `app/helpers/slack.js` | Slack notifications |

---

## Database (MongoDB)

**DB**: `binance-bot`

### Collections
- `trailing-trade-migrations` — Estado de migrações
- `global` — Configurações globais
- `symbols` — Configuração por símbolo
- `symbol-candles` — Dados de velas
- `symbol-ath` — All-Time-High records
- `symbol-tickers` — Tickers em tempo real
- `grid-trade` — Grid trade positions
- `orders` — Histórico de ordens
- `balances` — Saldos
- `logs` — Logs operacionais

### Migrations (20 arquivos)
`migrations/` — MongoDB state storage via `mongo-state-storage.js`

---

## Configuration

- `config/default.json` — Master config (estratégia, features)
- `config/test.json` — Overrides para testes
- `config/custom-environment-variables.json` — Mapeamento de env vars
- `.env.dist` — Template de ambiente

---

## Testes

**Framework**: Jest
**Mock setup**: `jest.setup.js`, `__mocks__/`

### Arquivos de Teste (20+)
- `__tests__/Gruntfile.test.js`
- `app/__tests__/server.test.js`, `server-binance.test.js`, `server-cronjob.test.js`, `server-frontend.test.js`, `error-handler.test.js`
- `app/binance/__tests__/candles.test.js`, `ath-candles.test.js`, `tickers.test.js`, `orders.test.js`, `user.test.js`
- `app/helpers/__tests__/cache.test.js`, `mongo.test.js`, `binance.test.js`, `logger.test.js`, `slack.test.js`, `pubsub.test.js`
- `app/cronjob/trailingTrade/__tests__/` — Testes de steps individuais

---

## Docker Compose

| Serviço | Porta | Função |
|---------|-------|--------|
| binance-bot | 8080 | App principal (Node.js) |
| tradingview | 8082 | Análise técnica (Python) |
| binance-redis | 6379 | Cache + PubSub |
| binance-mongo | — | Banco de dados |
| binance-mongo-express | 8081 | Admin UI MongoDB |

---

## Regras de Segurança (MAINTENANCE MODE)

1. NUNCA modificar lógica de compra/venda sem testes extensivos
2. NUNCA expor API keys em logs
3. NUNCA desviar do padrão trailing-trade sem revisão
4. Qualquer mudança financeira requer validação manual
5. MongoDB 3.2.20 constraint — respeitar compatibilidade

(Mantenha atualizado se novas estratégias ou serviços forem adicionados.)
