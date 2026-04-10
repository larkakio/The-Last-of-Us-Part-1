# Neon Wasteland: Outskirts

Mobile-first **Next.js** mini-game (swipe grid survival) plus **daily on-chain check-in** on Base, with **ERC-8021 builder attribution** on writes (via `ox`).

- **Web app**: [`web/`](web/) — Vercel root directory = `web`
- **Contract**: [`contracts/`](contracts/) — Foundry + `forge test`

## Quick start

```bash
cd web && npm install && npm run dev
```

```bash
cd contracts && forge test
```

## Environment

Copy [`web/.env.example`](web/.env.example) to `web/.env.local` and fill in builder code if needed. Production URL: **https://the-last-of-us-part-1.vercel.app**. Base App ID is set for `base:app_id` meta verification.

The deployed **DailyCheckIn** contract on Base mainnet is `0x6800584b071A91a7156C0A1C6ee521E5F5Bb35cc` (see [`contracts/DEPLOYMENT.md`](contracts/DEPLOYMENT.md)).

## Base App

Standard web + wallet (wagmi / viem). No Farcaster mini-app SDK. Optional: set `NEXT_PUBLIC_BASE_APP_ID` for `metadata.other["base:app_id"]`.

## Assets

App icon and Open Graph thumbnail are **JPG** under `web/public/` (`app-icon.jpg`, `app-thumbnail.jpg`).
