# Home Care 360 — web

The customer, provider and manager web app. Next.js (App Router), Tailwind,
shadcn/ui, react-hook-form + zod, drag-and-drop boards (dnd-kit), an AI chat
widget (Vercel AI SDK + n8n chat), direct-to-S3 uploads.

```bash
npm install
cp .env.example .env    # NEXT_PUBLIC_API_URL_BACKEND → the gateway
npm run dev
```

Ships as a Docker image (`Dockerfile`, `docker-compose.yml`).

## Configuration

Read from the environment (names as used in the code; no values are committed):

- `NEXT_PUBLIC_API_URL_BACKEND`


## Part of Home Care 360

FPT University capstone project (2024–2025), built by a team of four; backend
services by [@tientran1234](https://github.com/tientran1234). The platform
overview, architecture diagram and the list of every service live in
[CAPSTONE_HOME_CARE_BE_MICROSERVICES](https://github.com/HOME-CARE-360/CAPSTONE_HOME_CARE_BE_MICROSERVICES).
