# 서울 지하철 앱

서울 지하철 9개 노선의 인터랙티브 노선도, 경로 탐색, 실시간 도착 정보, 실내 안내를 제공하는 웹앱.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/seoul-subway run dev` — run the frontend (uses $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `SEOUL_SUBWAY_API_KEY` — Seoul Open Data API key for realtime arrivals

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TanStack Query, Tailwind CSS, shadcn/ui
- API: Express 5
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/seoul-subway/src/components/MapViewer.tsx` — SVG schematic metro map (pan/zoom)
- `artifacts/seoul-subway/src/components/ControlPanel.tsx` — 3-tab bottom panel
- `artifacts/seoul-subway/src/components/IndoorNavigationModal.tsx` — indoor nav + voice guidance
- `artifacts/api-server/src/routes/subway.ts` — all subway API routes
- `artifacts/api-server/src/routes/subway-data.ts` — full station data, BFS pathfinding, graph
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)

## Architecture decisions

- Map is rendered as inline SVG (no external images) to avoid CORS issues and enable smooth pan/zoom
- BFS pathfinding on a station graph where transfer connections add edges between same-named stations on different lines
- Realtime arrival data is proxied through the backend to hide the API key from the client
- All API types are generated from OpenAPI spec via Orval — never write API types by hand

## Product

- Interactive schematic map of Seoul Metro lines 1-9 with pan/zoom
- Station search and line filter (노선 선택 tab)
- Shortest-path route finder with horizontal line visualization and boarding instructions (경로 탐색 tab)
- Realtime arrival board using Seoul Open Data API (실시간 도착 tab)
- Indoor navigation modal with voice guidance (Korean, Web Speech API) triggered by clicking transfer stations

## User preferences

- Korean UI throughout
- Dark map background (#0d1117) with colored lines
- Controls panel takes exactly 1/5 of screen height

## Gotchas

- Seoul Open Data API (`SEOUL_SUBWAY_API_KEY`) is required for realtime arrivals; without it arrivals return empty
- Map SVG coordinate space is 200×160; station positions are approximate/schematic, not geographically precise
- `pnpm --filter @workspace/api-spec run codegen` must be re-run after any OpenAPI spec changes
