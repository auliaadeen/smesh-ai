Next.js app for **Smesh AI — Multi-Agent Workforce for Indonesian UMKM**.

See the [repo root README](../README.md) for architecture, environment
variables, and how the AI agents work, and
[`EDGEONE_DEPLOYMENT_NOTES.md`](./EDGEONE_DEPLOYMENT_NOTES.md) for
deployment details.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in OPENAI_API_KEY
npm run dev
```

```bash
npm run lint
npm run build
npx vitest run
```
