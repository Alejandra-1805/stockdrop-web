# StockDrop

Front-end concept for StockDrop.

## What it is
Creator fees build a Drop Pool. When the target is reached, the selected Robinhood Stock Token can be acquired by a separate backend/bot and distributed to eligible holders.

## Important
This repository is intentionally separate from the existing rewards bot.
Do not point this front-end at the old bot service and do not copy secrets into the browser.

The included UI defaults to `apiBase: ""`, which means it does **not** fabricate live rewards or transactions.
Connect a real backend endpoint before presenting balances/history as live.

## Run locally
Open `index.html`, or:
```bash
python -m http.server 8080
```

## Expected live API
`GET /api/status`

Example:
```json
{
  "poolUsd": 84.27,
  "targetUsd": 100,
  "nextAsset": "NVDA",
  "totalDroppedUsd": 0,
  "events": [
    {"label":"CREATOR FEE RECEIVED","amount":"+$1.16","confirmed":true}
  ]
}
```

## Separation
Recommended:
- existing-rewards-bot  -> untouched
- stockdrop-web         -> this app
- stockdrop-bot         -> new independent reward engine

## Sound
A subtle generated tick is included. Replace it later with your chosen audio file if desired.
