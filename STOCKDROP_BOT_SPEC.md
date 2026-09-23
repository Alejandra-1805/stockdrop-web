# stockdrop-bot — separate implementation notes

This bot must be a NEW service/repository. Do not modify the existing META rewards bot.

## Required phases

1. READ
- Read creator-fee wallet balance/events.
- Read token holders.
- Read official Stock Token contract address from Robinhood Chain's current registry/API.

2. ACQUIRE
Two valid options:
- Pre-fund the bot wallet with the selected Stock Token; then distribution can begin immediately.
- Or integrate a real supported swap/liquidity route that acquires the selected Stock Token from the fee asset.

Do not claim automatic purchasing until this transaction succeeds onchain.

3. SNAPSHOT
- Snapshot eligible holders at the distribution block.
- Exclude deployer/bot/liquidity/system addresses according to explicit rules.

4. CALCULATE
share_i = eligible_balance_i / total_eligible_balance
reward_i = distributable_stock_token_balance * share_i

5. DISTRIBUTE
- Send the selected Stock Token ERC-20 from the bot wallet to recipients.
- Use the Stock Token's canonical contract address.
- Record transaction hashes.
- Leave enough ETH for gas.

6. API
Expose read-only status/history for the website.
Never expose private keys.

## Safety separation
- New Railway project/service.
- New GitHub repository.
- Separate environment variables.
- Same wallet addresses may be referenced, but the existing bot deployment is not modified.
