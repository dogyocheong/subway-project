import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetIndoorNav,
  getGetIndoorNavQueryKey,
} from "@workspace/api-client-react";

interface Props {
  stationName: string;
  lineNumber?: string;
  onClose: () => void;
}

export default function IndoorNavigationModal({ stationName, lineNumber, onClose }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { data, isLoading, isError } = useGetIndoorNav(
    stationName,
    lineNumber ? { line: lineNumber } : {},
    {
      query: {
        enabled: !!stationName,
        queryKey: getGetIndoorNavQueryKey(stationName, lineNumber ? { line: lineNumber } : {}),
        staleTime: 1000 * 60 * 10,
      },
    }
  );

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isSpeaking) setActiveStep(null);
  }, [isSpeaking]);

  const speak = useCallback((text: string, stepIdx?: number) => {
    if (!window.speechSynthesis) {
      alert("이 브라우저는 음성 안내를 지원하지 않습니다.");
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = 0.88;
    utt.pitch = 1.0;
    utt.onstart = () => {
      setIsSpeaking(true);
      if (stepIdx !== undefined) setActiveStep(stepIdx);
    };
    utt.onend = () => {
      setIsSpeaking(false);
      setActiveStep(null);
    };
    utt.onerror = () => {
      setIsSpeaking(false);
      setActiveStep(null);
    };
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setActiveStep(null);
  }, []);

  const handleFullGuide = useCallback(() => {
    if (isSpeaking) { stopSpeaking(); return; }
    if (!data) return;
    speak(data.voiceGuide);
  }, [isSpeaking, data, speak, stopSpeaking]);

  const handleStepSpeak = useCallback((text: string, idx: number) => {
    if (isSpeaking && activeStep === idx) { stopSpeaking(); return; }
    speak(text, idx);
  }, [isSpeaking, activeStep, speak, stopSpeaking]);

  const lineColor = lineNumber ? LINE_COLORS[lineNumber] || "#555" : "#555";
  const lineName = lineNumber ? LINE_NAMES[lineNumber] || "" : "";

  return (
    <Dialog open={!!stationName} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm max-h-[88vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            {lineName && (
              <span className="px-2 py-0.5 rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: lineColor }}>{lineName}</span>
            )}
            <DialogTitle className="text-base font-bold">{stationName}역 실내 안내</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">AI 분석 기반 · 시각장애인 음성 안내 지원</p>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">AI 분석 데이터 불러오는 중...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center h-32 gap-3 px-4">
              <div className="text-3xl">🚧</div>
              <p className="text-sm text-center text-muted-foreground">
                이 역의 실내 안내 데이터를 아직 처리 중입니다.<br />
                분석 완료 후 이용하실 수 있습니다.
              </p>
            </div>
          )}

          {data && !isLoading && (
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-4 pb-6">

                {/* Full voice guide button */}
                <Button
                  className="w-full h-11 text-sm font-bold gap-2"
                  style={isSpeaking ? {} : { backgroundColor: lineColor, borderColor: lineColor }}
                  variant={isSpeaking ? "destructive" : "default"}
                  onClick={handleFullGuide}
                >
                  <span className="text-lg">{isSpeaking ? "⏹" : "🔊"}</span>
                  {isSpeaking ? "음성 안내 중지" : "전체 음성 안내 시작"}
                </Button>

                {/* Transfer station selector */}
                {data.allLines && data.allLines.length > 1 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">환승역 — 노선별 안내</p>
                    <div className="flex gap-2 flex-wrap">
                      {data.allLines.map((item, i) => (
                        <button key={i}
                          className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
                          style={{
                            backgroundColor: lineColor,
                            color: "#fff",
                            borderColor: lineColor,
                          }}
                          onClick={() => item.voiceGuide && speak(item.voiceGuide)}
                        >
                          {item.line}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floors */}
                {data.floors && data.floors.length > 0 && (
                  <Section title="층 구성" icon="🏢">
                    <div className="flex flex-wrap gap-2">
                      {data.floors.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs bg-muted/50">
                          <span className="font-bold text-foreground">{f.level}</span>
                          <span className="text-muted-foreground">{f.name}</span>
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Exits */}
                {data.exits && data.exits.length > 0 && (
                  <Section title="출구 정보" icon="🚪">
                    <div className="space-y-1.5">
                      {data.exits.map((ex, i) => (
                        <button key={i}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all border ${activeStep === 100 + i ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/60"}`}
                          onClick={() => handleStepSpeak(`${ex.number}번 출구. ${ex.description}`, 100 + i)}
                        >
                          <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ backgroundColor: lineColor }}>{ex.number}</span>
                          <span className="text-xs text-foreground flex-1">{ex.description}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {activeStep === 100 + i ? "🔊" : "▶"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Facilities */}
                {data.facilities && data.facilities.length > 0 && (
                  <Section title="주요 시설" icon="♿">
                    <div className="space-y-1.5">
                      {data.facilities.map((fac, i) => {
                        const icon = facilityIcon(fac.type);
                        const speakText = `${fac.type}. ${fac.location}에 위치. ${fac.floors}층.`;
                        return (
                          <button key={i}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all border ${activeStep === 200 + i ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/60"}`}
                            onClick={() => handleStepSpeak(speakText, 200 + i)}
                          >
                            <span className="text-base flex-shrink-0">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold">{fac.type}</div>
                              <div className="text-[10px] text-muted-foreground">{fac.location} · {fac.floors}</div>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {activeStep === 200 + i ? "🔊" : "▶"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Directions */}
                {data.directions && data.directions.length > 0 && (
                  <Section title="방면 안내" icon="🧭">
                    <div className="space-y-1.5">
                      {data.directions.map((dir, i) => {
                        const speakText = `${dir.toward} 방면. ${dir.side}쪽 출구.`;
                        return (
                          <button key={i}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all border ${activeStep === 300 + i ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/60"}`}
                            onClick={() => handleStepSpeak(speakText, 300 + i)}
                          >
                            <span className="text-base flex-shrink-0">
                              {dir.side === "왼쪽" || dir.side === "left" ? "◀" : "▶"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold">{dir.toward} 방면</div>
                              <div className="text-[10px] text-muted-foreground">{dir.side}쪽</div>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {activeStep === 300 + i ? "🔊" : "▶"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Transfers */}
                {data.transfers && data.transfers.length > 0 && (
                  <Section title="환승 안내" icon="🔀">
                    <div className="space-y-1.5">
                      {data.transfers.map((tr, i) => {
                        const speakText = `${tr.line} 환승. ${tr.floor}. ${tr.description}`;
                        return (
                          <button key={i}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all border ${activeStep === 400 + i ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/60"}`}
                            onClick={() => handleStepSpeak(speakText, 400 + i)}
                          >
                            <span className="text-sm flex-shrink-0">🚇</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold">{tr.line}</div>
                              <div className="text-[10px] text-muted-foreground">{tr.floor} · {tr.description}</div>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {activeStep === 400 + i ? "🔊" : "▶"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-bold text-foreground uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  );
}

function facilityIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("엘리베이터") || t.includes("elevator")) return "🛗";
  if (t.includes("에스컬레이터") || t.includes("escalator")) return "🪜";
  if (t.includes("화장실") || t.includes("toilet")) return "🚻";
  if (t.includes("계단") || t.includes("stairs")) return "🪜";
  if (t.includes("수유") || t.includes("baby")) return "🍼";
  if (t.includes("안내") || t.includes("info")) return "ℹ️";
  return "♿";
}

const LINE_COLORS: Record<string, string> = {
  "1": "#0052A4", "2": "#00A84D", "3": "#EF7C1C", "4": "#00A5DE",
  "5": "#996CAC", "6": "#CD7C2F", "7": "#747F00", "8": "#E6186C", "9": "#BDB092",
  "경의중앙": "#77C4A3", "공항": "#4EA4D4", "수인분당": "#F5A200",
  "신분당": "#D31145", "경춘": "#0C8E72", "우이신설": "#B0CE18",
  "신림": "#6789CA", "김포골드": "#9DC15D", "GTX-A": "#005EB8",
};

const LINE_NAMES: Record<string, string> = {
  "1": "1호선", "2": "2호선", "3": "3호선", "4": "4호선", "5": "5호선",
  "6": "6호선", "7": "7호선", "8": "8호선", "9": "9호선",
  "경의중앙": "경의중앙선", "공항": "공항철도", "수인분당": "수인분당선",
  "신분당": "신분당선", "경춘": "경춘선", "우이신설": "우이신설선",
  "신림": "신림선", "김포골드": "김포골드라인", "GTX-A": "GTX-A",
};
