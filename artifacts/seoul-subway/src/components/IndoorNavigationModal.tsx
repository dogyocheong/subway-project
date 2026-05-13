import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetStationMap, getGetStationMapQueryKey } from "@workspace/api-client-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function IndoorNavigationModal({ 
  stationName, 
  onClose 
}: { 
  stationName: string; 
  onClose: () => void;
}) {
  const { data: mapData, isLoading } = useGetStationMap(stationName, {
    query: { 
      enabled: !!stationName,
      queryKey: getGetStationMapQueryKey(stationName)
    }
  });

  const handleStartGuide = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance("안내를 시작합니다. 개찰구를 통과하여 직진하세요.");
    utterance.lang = "ko-KR";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Dialog open={!!stationName} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{stationName}역 실내 안내</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">불러오는 중...</div>
        ) : mapData ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <Button className="w-full" onClick={handleStartGuide} data-testid="button-start-guide">
                안내 시작 (음성)
              </Button>

              <div>
                <h3 className="font-semibold text-sm mb-2">출구 정보</h3>
                <ul className="text-sm space-y-1">
                  {mapData.exits.map((ex, i) => (
                    <li key={i}><span className="font-medium mr-2">{ex.number}번</span> {ex.description}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">시설</h3>
                <ul className="text-sm space-y-1">
                  {mapData.facilities.map((fac, i) => (
                    <li key={i}><span className="font-medium mr-2">{fac.type}</span> {fac.location} - {fac.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
