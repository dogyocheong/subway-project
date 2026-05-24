/**
 * 역 안내도 이미지(269장)를 Claude 비전으로 분석해
 * 역내 경로 안내 구조화 데이터를 생성합니다.
 *
 * 출력: artifacts/api-server/src/routes/indoor-nav-data.json
 * 진행 상황: 이미지마다 즉시 저장 (재실행 시 완료 항목 건너뜀)
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, "../..");

const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
if (!baseURL || !apiKey) {
  console.error("AI_INTEGRATIONS 환경변수 미설정");
  process.exit(1);
}
const anthropic = new Anthropic({ apiKey, baseURL });

// ─── 타입 ─────────────────────────────────────────────────────────────────────
export interface FloorInfo { level: string; name: string; }
export interface ExitInfo { number: string; description: string; }
export interface FacilityInfo {
  type: "escalator" | "elevator" | "stairs" | "lift";
  location: string; floors: string;
}
export interface DirectionInfo { toward: string; side: string; }
export interface TransferInfo { line: string; floor: string; description: string; }
export interface StationNavData {
  stationCode: string;
  stationName: string;
  line: string;
  floors: FloorInfo[];
  exits: ExitInfo[];
  facilities: FacilityInfo[];
  directions: DirectionInfo[];
  transfers: TransferInfo[];
  voiceGuide: string;
}

// ─── 이미지 수집 ──────────────────────────────────────────────────────────────
interface ImageTask { line: string; filename: string; filepath: string; key: string; }

function collectImages(): ImageTask[] {
  const base = path.join(WORKSPACE_ROOT, "attached_assets/station_maps");
  const tasks: ImageTask[] = [];
  for (const lineDir of fs.readdirSync(base).sort()) {
    const sub = path.join(base, lineDir, lineDir);
    if (!fs.existsSync(sub)) continue;
    for (const file of fs.readdirSync(sub).sort()) {
      if (!file.toLowerCase().endsWith(".jpg")) continue;
      tasks.push({
        line: lineDir, filename: file,
        filepath: path.join(sub, file),
        key: `${lineDir}::${file}`,
      });
    }
  }
  return tasks;
}

// ─── 점진적 저장 ──────────────────────────────────────────────────────────────
const OUTPUT_PATH = path.join(WORKSPACE_ROOT, "artifacts/api-server/src/routes/indoor-nav-data.json");

function loadExisting(): Map<string, StationNavData> {
  const map = new Map<string, StationNavData>();
  if (!fs.existsSync(OUTPUT_PATH)) return map;
  try {
    const raw = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8")) as StationNavData[];
    raw.forEach(item => map.set(`${item.line}::${item.stationName}`, item));
    console.log(`기존 결과 ${raw.length}개 로드 (완료 항목 건너뜀)`);
  } catch { console.log("기존 파일 파싱 실패 — 새로 시작"); }
  return map;
}

function saveAll(results: Map<string, StationNavData>) {
  const arr = Array.from(results.values()).sort((a, b) => {
    if (a.line !== b.line) return a.line.localeCompare(b.line);
    return a.stationCode.localeCompare(b.stationCode, undefined, { numeric: true });
  });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(arr, null, 2), "utf-8");
}

// ─── Claude 분석 ─────────────────────────────────────────────────────────────
const PROMPT = `이 이미지는 서울 지하철 역의 "역 이용 및 비상대피 안내도"입니다.
이미지를 꼼꼼히 분석해서 아래 JSON 형식으로만 응답하세요. 마크다운 없이 순수 JSON만 출력하세요.

{
  "stationCode": "역 코드 번호 (예: 124)",
  "stationName": "역 이름 한국어 (예: 청량리)",
  "line": "노선명 (예: 1호선)",
  "floors": [
    { "level": "B1", "name": "승강장" },
    { "level": "B2", "name": "대합실" }
  ],
  "exits": [
    { "number": "1", "description": "OO 방향, 주변 건물/도로명" }
  ],
  "facilities": [
    { "type": "elevator", "location": "대합실 중앙", "floors": "B1↔B2" },
    { "type": "escalator", "location": "1번 출구 옆", "floors": "B1↔B2" },
    { "type": "stairs", "location": "2번 출구 방향", "floors": "B1↔B2" }
  ],
  "directions": [
    { "toward": "OO역 방면", "side": "왼쪽" },
    { "toward": "OO역 방면", "side": "오른쪽" }
  ],
  "transfers": [
    { "line": "2호선", "floor": "B2", "description": "대합실에서 직진 후 환승 통로 이용" }
  ],
  "voiceGuide": "이 역은 지하 2층 구조입니다. 지하 1층은 대합실, 지하 2층은 승강장입니다. 출구는 총 N개이며 엘리베이터는 중앙에 위치합니다."
}

분석 지침:
- floors: 단면도에 표시된 모든 층 포함
- exits: 노란 박스로 표시된 출구 번호 모두 포함
- facilities: 엘리베이터, 에스컬레이터, 계단, 장애인 리프트 모두 포함
- directions: 승강장 양 끝 방면 표시 모두 포함
- transfers: 다른 노선 환승 정보 (없으면 빈 배열)
- voiceGuide: 시각장애인용 안내 2~4문장 (층 구조, 출구 수, 편의시설 위치)`;

async function analyzeImage(task: ImageTask): Promise<StationNavData | null> {
  const base64 = fs.readFileSync(task.filepath).toString("base64");
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
          { type: "text", text: PROMPT },
        ],
      }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.error(`  [WARN] JSON 없음: ${task.filename}`); return null; }
    return JSON.parse(jsonMatch[0]) as StationNavData;
  } catch (err: any) {
    console.error(`  [ERROR] ${task.filename}: ${err?.message || err}`);
    return null;
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function processWithRetry(task: ImageTask, retries = 3): Promise<StationNavData | null> {
  for (let i = 0; i <= retries; i++) {
    const result = await analyzeImage(task);
    if (result) return result;
    if (i < retries) {
      const wait = Math.min(3000 * 2 ** i, 20000);
      console.log(`  재시도 ${i + 1}/${retries} (${wait / 1000}s): ${task.filename}`);
      await sleep(wait);
    }
  }
  return null;
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  const results = loadExisting();
  const allTasks = collectImages();

  // 이미 처리된 항목은 건너뜀 (stationName 기반)
  const done = new Set(Array.from(results.keys()));
  const pending = allTasks.filter(t => {
    // 기존 결과에 같은 파일명이 있으면 건너뜀
    const namePart = t.filename.replace(/\.\w+$/, "").replace(/[-\s_수정\d차]+$/g, "").trim();
    return !Array.from(done).some(k => k.includes(namePart.slice(-4)));
  });

  console.log(`총 ${allTasks.length}개 중 ${pending.length}개 미처리 (concurrency=2)\n`);
  if (pending.length === 0) { console.log("모든 이미지 처리 완료!"); return; }

  let completed = allTasks.length - pending.length;
  const total = allTasks.length;

  // 한 번에 2개씩 처리, 즉시 저장
  for (let i = 0; i < pending.length; i += 2) {
    const batch = pending.slice(i, i + 2);
    const batchResults = await Promise.all(batch.map(t => processWithRetry(t)));

    for (let j = 0; j < batch.length; j++) {
      completed++;
      const task = batch[j];
      const result = batchResults[j];
      const pct = ((completed / total) * 100).toFixed(1);
      if (result) {
        results.set(`${result.line}::${result.stationName}`, result);
        saveAll(results);  // 즉시 저장
        console.log(`[${completed}/${total}] ${pct}% ✓ ${task.filename} → ${result.stationName}`);
      } else {
        console.log(`[${completed}/${total}] ${pct}% ✗ ${task.filename} (실패)`);
      }
    }
  }

  console.log(`\n완료! ${results.size}개 역 저장: ${OUTPUT_PATH}`);
}

main().catch(err => { console.error("오류:", err); process.exit(1); });
