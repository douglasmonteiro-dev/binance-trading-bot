# Binance Trading Bot

## Configuração GitHub
```json
{
  "repository": "https://github.com/douglasmonteiro-dev/binance-trading-bot.git",
  "defaultBranch": "master",
  "developmentBranch": "master",
  "prStrategy": "direct",
  "requiresReview": false,
  "allowDirectPushToMain": true
}
```

## Configuração Portainer
```yaml
portainer:
  stackName: binance-bot-local
  environment: local
  composePath: docker-compose.yml
  network: webhouse-network
  healthcheck: /health
  restartPolicy: unless-stopped
```
