# DailyCheckIn (Foundry)

Solidity contract for one check-in per UTC epoch day (`block.timestamp / 1 days`), streak tracking, and `msg.value` forbidden.

## Test

```bash
forge test
```

## Deploy (example — Base mainnet)

Set `PRIVATE_KEY` and `RPC_URL` (e.g. from a provider), then:

```bash
forge create src/DailyCheckIn.sol:DailyCheckIn --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

Copy the deployed address into `web/.env` as `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS`.

## Notes

- Storage uses `day + 1` in `lastDayPlusOne` so “never checked” (`0`) is distinct from “checked on calendar day 0” after the Unix epoch.
- Do not send ETH with `checkIn`; the function reverts if `msg.value != 0`.
