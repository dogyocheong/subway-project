// Seoul Subway complete station data with line info
// Lines: 1-9호선, 경의중앙선, 공항철도, 분당선, 신분당선, 경춘선, 수인선, 우이신설선, 서해선, 경강선, 신림선

export interface StationInfo {
  id: string;
  name: string;
  line: string;
  lineNumber: string;
  lineColor: string;
  transferLines?: string[];
}

export const LINE_COLORS: Record<string, string> = {
  "1": "#0052A4",
  "2": "#00A84D",
  "3": "#EF7C1C",
  "4": "#00A5DE",
  "5": "#996CAC",
  "6": "#CD7C2F",
  "7": "#747F00",
  "8": "#E6186C",
  "9": "#BDB092",
  "경의중앙": "#77C4A3",
  "공항": "#4EA4D4",
  "분당": "#F5A200",
  "신분당": "#D31145",
  "경춘": "#0C8E72",
  "수인": "#F5A200",
  "우이신설": "#B0CE18",
  "서해": "#8FC31F",
  "경강": "#003DA5",
  "신림": "#6789CA",
};

export const LINE_NAMES: Record<string, string> = {
  "1": "1호선",
  "2": "2호선",
  "3": "3호선",
  "4": "4호선",
  "5": "5호선",
  "6": "6호선",
  "7": "7호선",
  "8": "8호선",
  "9": "9호선",
  "경의중앙": "경의중앙선",
  "공항": "공항철도",
  "분당": "분당선",
  "신분당": "신분당선",
  "경춘": "경춘선",
  "수인": "수인선",
  "우이신설": "우이신설선",
  "서해": "서해선",
  "경강": "경강선",
  "신림": "신림선",
};

// Graph: station connections for pathfinding
// Format: { stationName+line: [adjacent stationName+line, ...] }
export const SUBWAY_GRAPH: Record<string, string[]> = {};

// All stations with their line info
export const ALL_STATIONS: StationInfo[] = [
  // 1호선
  { id: "1-소요산", name: "소요산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-동두천", name: "동두천", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-보산", name: "보산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-동두천중앙", name: "동두천중앙", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-지행", name: "지행", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-덕정", name: "덕정", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-덕계", name: "덕계", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-양주", name: "양주", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-녹양", name: "녹양", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-가능", name: "가능", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-의정부", name: "의정부", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-회룡", name: "회룡", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-망월사", name: "망월사", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-도봉산", name: "도봉산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-도봉", name: "도봉", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-방학", name: "방학", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-창동", name: "창동", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-녹천", name: "녹천", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-월계", name: "월계", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-광운대", name: "광운대", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-석계", name: "석계", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-신이문", name: "신이문", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-외대앞", name: "외대앞", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-회기", name: "회기", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-청량리", name: "청량리", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-제기동", name: "제기동", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-신설동", name: "신설동", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-동묘앞", name: "동묘앞", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-동대문", name: "동대문", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-종로5가", name: "종로5가", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-종로3가", name: "종로3가", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-종각", name: "종각", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-시청", name: "시청", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-서울역", name: "서울역", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-남영", name: "남영", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-용산", name: "용산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-노량진", name: "노량진", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-대방", name: "대방", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-신길", name: "신길", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-영등포", name: "영등포", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-신도림", name: "신도림", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-구로", name: "구로", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-구일", name: "구일", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-개봉", name: "개봉", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-오류동", name: "오류동", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-온수", name: "온수", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-역곡", name: "역곡", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-소사", name: "소사", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-부천", name: "부천", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-중동", name: "중동", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-송내", name: "송내", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-부개", name: "부개", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-부평", name: "부평", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-백운", name: "백운", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-동암", name: "동암", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-간석", name: "간석", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-주안", name: "주안", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-도화", name: "도화", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-제물포", name: "제물포", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-도원", name: "도원", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-동인천", name: "동인천", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-인천", name: "인천", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  // 1호선 경부선 (서울역 이하)
  { id: "1-가산디지털단지", name: "가산디지털단지", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-독산", name: "독산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-금천구청", name: "금천구청", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-석수", name: "석수", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-관악", name: "관악", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-안양", name: "안양", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-명학", name: "명학", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-금정", name: "금정", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-군포", name: "군포", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-당정", name: "당정", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-의왕", name: "의왕", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-성균관대", name: "성균관대", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-화서", name: "화서", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-수원", name: "수원", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-세류", name: "세류", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-병점", name: "병점", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-세마", name: "세마", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-오산대", name: "오산대", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-오산", name: "오산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-진위", name: "진위", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-송탄", name: "송탄", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-서정리", name: "서정리", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-지제", name: "지제", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-평택", name: "평택", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-성환", name: "성환", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-직산", name: "직산", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-두정", name: "두정", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },
  { id: "1-천안", name: "천안", line: "1호선", lineNumber: "1", lineColor: LINE_COLORS["1"] },

  // 2호선 (순환선 + 지선)
  { id: "2-시청", name: "시청", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-을지로입구", name: "을지로입구", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-을지로3가", name: "을지로3가", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-을지로4가", name: "을지로4가", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-동대문역사문화공원", name: "동대문역사문화공원", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-신당", name: "신당", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-상왕십리", name: "상왕십리", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-왕십리", name: "왕십리", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-한양대", name: "한양대", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-뚝섬", name: "뚝섬", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-성수", name: "성수", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-건대입구", name: "건대입구", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-구의", name: "구의", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-강변", name: "강변", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-잠실나루", name: "잠실나루", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-잠실", name: "잠실", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-잠실새내", name: "잠실새내", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-종합운동장", name: "종합운동장", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-삼성", name: "삼성", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-선릉", name: "선릉", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-역삼", name: "역삼", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-강남", name: "강남", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-교대", name: "교대", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-서초", name: "서초", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-방배", name: "방배", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-사당", name: "사당", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-낙성대", name: "낙성대", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-서울대입구", name: "서울대입구", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-봉천", name: "봉천", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-신림", name: "신림", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-신대방", name: "신대방", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-구로디지털단지", name: "구로디지털단지", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-대림", name: "대림", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-신도림", name: "신도림", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-문래", name: "문래", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-영등포구청", name: "영등포구청", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-당산", name: "당산", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-합정", name: "합정", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-홍대입구", name: "홍대입구", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-신촌", name: "신촌", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-이대", name: "이대", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-아현", name: "아현", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },
  { id: "2-충정로", name: "충정로", line: "2호선", lineNumber: "2", lineColor: LINE_COLORS["2"] },

  // 3호선
  { id: "3-대화", name: "대화", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-주엽", name: "주엽", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-정발산", name: "정발산", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-마두", name: "마두", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-백석", name: "백석", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-대곡", name: "대곡", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-화정", name: "화정", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-원당", name: "원당", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-원흥", name: "원흥", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-삼송", name: "삼송", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-지축", name: "지축", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-구파발", name: "구파발", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-연신내", name: "연신내", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-불광", name: "불광", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-녹번", name: "녹번", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-홍제", name: "홍제", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-무악재", name: "무악재", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-독립문", name: "독립문", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-경복궁", name: "경복궁", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-안국", name: "안국", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-종로3가", name: "종로3가", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-을지로3가", name: "을지로3가", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-충무로", name: "충무로", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-동대입구", name: "동대입구", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-약수", name: "약수", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-금호", name: "금호", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-옥수", name: "옥수", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-압구정", name: "압구정", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-신사", name: "신사", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-잠원", name: "잠원", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-고속터미널", name: "고속터미널", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-교대", name: "교대", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-남부터미널", name: "남부터미널", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-양재", name: "양재", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-매봉", name: "매봉", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-도곡", name: "도곡", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-대치", name: "대치", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-학여울", name: "학여울", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-대청", name: "대청", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-일원", name: "일원", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-수서", name: "수서", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-가락시장", name: "가락시장", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-경찰병원", name: "경찰병원", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },
  { id: "3-오금", name: "오금", line: "3호선", lineNumber: "3", lineColor: LINE_COLORS["3"] },

  // 4호선
  { id: "4-당고개", name: "당고개", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-상계", name: "상계", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-노원", name: "노원", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-창동", name: "창동", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-쌍문", name: "쌍문", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-수유", name: "수유", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-미아", name: "미아", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-미아사거리", name: "미아사거리", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-길음", name: "길음", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-성신여대입구", name: "성신여대입구", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-한성대입구", name: "한성대입구", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-혜화", name: "혜화", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-동대문", name: "동대문", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-동대문역사문화공원", name: "동대문역사문화공원", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-충무로", name: "충무로", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-명동", name: "명동", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-회현", name: "회현", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-서울역", name: "서울역", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-숙대입구", name: "숙대입구", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-삼각지", name: "삼각지", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-신용산", name: "신용산", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-이촌", name: "이촌", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-동작", name: "동작", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-이수", name: "이수", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-사당", name: "사당", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-남태령", name: "남태령", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-선바위", name: "선바위", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-경마공원", name: "경마공원", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-대공원", name: "대공원", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-과천", name: "과천", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-정부과천청사", name: "정부과천청사", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-인덕원", name: "인덕원", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-평촌", name: "평촌", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-범계", name: "범계", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-금정", name: "금정", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-산본", name: "산본", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-수리산", name: "수리산", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-대야미", name: "대야미", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-반월", name: "반월", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-상록수", name: "상록수", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-한대앞", name: "한대앞", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-중앙", name: "중앙", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-고잔", name: "고잔", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-초지", name: "초지", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-안산", name: "안산", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-신길온천", name: "신길온천", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-정왕", name: "정왕", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },
  { id: "4-오이도", name: "오이도", line: "4호선", lineNumber: "4", lineColor: LINE_COLORS["4"] },

  // 5호선
  { id: "5-방화", name: "방화", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-개화산", name: "개화산", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-김포공항", name: "김포공항", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-송정", name: "송정", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-마곡", name: "마곡", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-발산", name: "발산", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-우장산", name: "우장산", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-화곡", name: "화곡", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-까치산", name: "까치산", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-신정", name: "신정", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-목동", name: "목동", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-오목교", name: "오목교", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-양평", name: "양평", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-영등포구청", name: "영등포구청", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-영등포시장", name: "영등포시장", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-신길", name: "신길", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-여의도", name: "여의도", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-여의나루", name: "여의나루", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-마포", name: "마포", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-공덕", name: "공덕", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-애오개", name: "애오개", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-충정로", name: "충정로", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-서대문", name: "서대문", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-광화문", name: "광화문", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-종로3가", name: "종로3가", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-을지로4가", name: "을지로4가", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-동대문역사문화공원", name: "동대문역사문화공원", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-청구", name: "청구", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-신금호", name: "신금호", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-행당", name: "행당", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-왕십리", name: "왕십리", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-마장", name: "마장", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-답십리", name: "답십리", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-장한평", name: "장한평", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-군자", name: "군자", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-아차산", name: "아차산", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-광나루", name: "광나루", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-천호", name: "천호", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-강동", name: "강동", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-길동", name: "길동", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-굽은다리", name: "굽은다리", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-명일", name: "명일", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-고덕", name: "고덕", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-상일동", name: "상일동", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-둔촌동", name: "둔촌동", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-올림픽공원", name: "올림픽공원", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-방이", name: "방이", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-오금", name: "오금", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-개롱", name: "개롱", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-거여", name: "거여", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },
  { id: "5-마천", name: "마천", line: "5호선", lineNumber: "5", lineColor: LINE_COLORS["5"] },

  // 6호선
  { id: "6-응암", name: "응암", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-역촌", name: "역촌", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-불광", name: "불광", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-독바위", name: "독바위", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-연신내", name: "연신내", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-구산", name: "구산", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-새절", name: "새절", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-증산", name: "증산", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-디지털미디어시티", name: "디지털미디어시티", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-월드컵경기장", name: "월드컵경기장", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-마포구청", name: "마포구청", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-망원", name: "망원", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-합정", name: "합정", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-상수", name: "상수", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-광흥창", name: "광흥창", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-대흥", name: "대흥", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-공덕", name: "공덕", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-효창공원앞", name: "효창공원앞", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-삼각지", name: "삼각지", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-녹사평", name: "녹사평", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-이태원", name: "이태원", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-한강진", name: "한강진", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-버티고개", name: "버티고개", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-약수", name: "약수", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-청구", name: "청구", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-신당", name: "신당", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-동묘앞", name: "동묘앞", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-창신", name: "창신", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-봉화산", name: "봉화산", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-중계", name: "중계", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-하계", name: "하계", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-공릉", name: "공릉", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-태릉입구", name: "태릉입구", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-화랑대", name: "화랑대", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },
  { id: "6-봉화산(2)", name: "봉화산", line: "6호선", lineNumber: "6", lineColor: LINE_COLORS["6"] },

  // 7호선
  { id: "7-장암", name: "장암", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-도봉산", name: "도봉산", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-수락산", name: "수락산", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-마들", name: "마들", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-노원", name: "노원", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-중계", name: "중계", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-하계", name: "하계", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-공릉", name: "공릉", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-태릉입구", name: "태릉입구", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-먹골", name: "먹골", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-중화", name: "중화", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-상봉", name: "상봉", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-면목", name: "면목", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-사가정", name: "사가정", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-용마산", name: "용마산", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-중곡", name: "중곡", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-군자", name: "군자", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-어린이대공원", name: "어린이대공원", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-건대입구", name: "건대입구", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-뚝섬유원지", name: "뚝섬유원지", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-청담", name: "청담", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-강남구청", name: "강남구청", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-학동", name: "학동", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-논현", name: "논현", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-반포", name: "반포", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-고속터미널", name: "고속터미널", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-내방", name: "내방", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-이수", name: "이수", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-남성", name: "남성", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-숭실대입구", name: "숭실대입구", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-상도", name: "상도", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-장승배기", name: "장승배기", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-신대방삼거리", name: "신대방삼거리", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-보라매", name: "보라매", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-신풍", name: "신풍", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-대림", name: "대림", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-남구로", name: "남구로", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-가산디지털단지", name: "가산디지털단지", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-철산", name: "철산", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-광명사거리", name: "광명사거리", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-천왕", name: "천왕", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-온수", name: "온수", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-까치울", name: "까치울", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-부천종합운동장", name: "부천종합운동장", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-춘의", name: "춘의", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-신중동", name: "신중동", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-부천시청", name: "부천시청", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-상동", name: "상동", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-삼산체육관", name: "삼산체육관", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-굴포천", name: "굴포천", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },
  { id: "7-부평구청", name: "부평구청", line: "7호선", lineNumber: "7", lineColor: LINE_COLORS["7"] },

  // 8호선
  { id: "8-암사", name: "암사", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-천호", name: "천호", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-강동구청", name: "강동구청", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-몽촌토성", name: "몽촌토성", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-잠실", name: "잠실", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-석촌", name: "석촌", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-송파", name: "송파", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-가락시장", name: "가락시장", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-문정", name: "문정", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-장지", name: "장지", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-복정", name: "복정", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-남위례", name: "남위례", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-산성", name: "산성", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-남한산성입구", name: "남한산성입구", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-단대오거리", name: "단대오거리", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-신흥", name: "신흥", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-수진", name: "수진", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },
  { id: "8-모란", name: "모란", line: "8호선", lineNumber: "8", lineColor: LINE_COLORS["8"] },

  // 9호선
  { id: "9-개화", name: "개화", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-김포공항", name: "김포공항", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-공항시장", name: "공항시장", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-신방화", name: "신방화", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-마곡나루", name: "마곡나루", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-양천향교", name: "양천향교", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-가양", name: "가양", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-증미", name: "증미", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-등촌", name: "등촌", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-염창", name: "염창", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-신목동", name: "신목동", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-선유도", name: "선유도", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-당산", name: "당산", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-국회의사당", name: "국회의사당", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-여의도", name: "여의도", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-샛강", name: "샛강", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-노량진", name: "노량진", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-노들", name: "노들", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-흑석", name: "흑석", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-동작", name: "동작", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-구반포", name: "구반포", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-신반포", name: "신반포", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-고속터미널", name: "고속터미널", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-사평", name: "사평", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-신논현", name: "신논현", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-언주", name: "언주", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-선정릉", name: "선정릉", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-삼성중앙", name: "삼성중앙", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-봉은사", name: "봉은사", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-종합운동장", name: "종합운동장", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-삼전", name: "삼전", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-석촌고분", name: "석촌고분", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-석촌", name: "석촌", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-송파나루", name: "송파나루", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-한성백제", name: "한성백제", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-올림픽공원", name: "올림픽공원", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-둔촌오륜", name: "둔촌오륜", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
  { id: "9-중앙보훈병원", name: "중앙보훈병원", line: "9호선", lineNumber: "9", lineColor: LINE_COLORS["9"] },
];

// Build the subway graph for pathfinding
// Line 1 sequential connections
const line1Stations = [
  "소요산","동두천","보산","동두천중앙","지행","덕정","덕계","양주","녹양","가능","의정부","회룡","망월사",
  "도봉산","도봉","방학","창동","녹천","월계","광운대","석계","신이문","외대앞","회기","청량리",
  "제기동","신설동","동묘앞","동대문","종로5가","종로3가","종각","시청","서울역","남영","용산","노량진",
  "대방","신길","영등포","신도림","구로","구일","개봉","오류동","온수","역곡","소사","부천","중동","송내","부개","부평","백운","동암","간석","주안","도화","제물포","도원","동인천","인천"
];
// 경부선 분기 (구로 -> 가산디지털단지)
const line1Branch = [
  "구로","가산디지털단지","독산","금천구청","석수","관악","안양","명학","금정","군포","당정","의왕","성균관대","화서","수원","세류","병점","세마","오산대","오산","진위","송탄","서정리","지제","평택","성환","직산","두정","천안"
];

// Line 2 (circular line)
const line2Stations = [
  "시청","을지로입구","을지로3가","을지로4가","동대문역사문화공원","신당","상왕십리","왕십리","한양대","뚝섬","성수",
  "건대입구","구의","강변","잠실나루","잠실","잠실새내","종합운동장","삼성","선릉","역삼","강남","교대","서초","방배","사당","낙성대","서울대입구","봉천","신림","신대방","구로디지털단지","대림","신도림","문래","영등포구청","당산","합정","홍대입구","신촌","이대","아현","충정로"
];

// Line 3
const line3Stations = [
  "대화","주엽","정발산","마두","백석","대곡","화정","원당","원흥","삼송","지축","구파발","연신내","불광","녹번","홍제","무악재","독립문","경복궁","안국","종로3가","을지로3가","충무로","동대입구","약수","금호","옥수","압구정","신사","잠원","고속터미널","교대","남부터미널","양재","매봉","도곡","대치","학여울","대청","일원","수서","가락시장","경찰병원","오금"
];

// Line 4
const line4Stations = [
  "당고개","상계","노원","창동","쌍문","수유","미아","미아사거리","길음","성신여대입구","한성대입구","혜화","동대문","동대문역사문화공원","충무로","명동","회현","서울역","숙대입구","삼각지","신용산","이촌","동작","이수","사당","남태령","선바위","경마공원","대공원","과천","정부과천청사","인덕원","평촌","범계","금정","산본","수리산","대야미","반월","상록수","한대앞","중앙","고잔","초지","안산","신길온천","정왕","오이도"
];

// Line 5 (two branches at Gangdong)
const line5StationsMain = [
  "방화","개화산","김포공항","송정","마곡","발산","우장산","화곡","까치산","신정","목동","오목교","양평","영등포구청","영등포시장","신길","여의도","여의나루","마포","공덕","애오개","충정로","서대문","광화문","종로3가","을지로4가","동대문역사문화공원","청구","신금호","행당","왕십리","마장","답십리","장한평","군자","아차산","광나루","천호","강동"
];
const line5BranchA = ["강동","길동","굽은다리","명일","고덕","상일동"];
const line5BranchB = ["강동","둔촌동","올림픽공원","방이","오금","개롱","거여","마천"];

// Line 6
const line6Stations = [
  "응암","역촌","불광","독바위","연신내","구산","새절","증산","디지털미디어시티","월드컵경기장","마포구청","망원","합정","상수","광흥창","대흥","공덕","효창공원앞","삼각지","녹사평","이태원","한강진","버티고개","약수","청구","신당","동묘앞","창신","봉화산","중계","하계","공릉","태릉입구","화랑대"
];

// Line 7
const line7Stations = [
  "장암","도봉산","수락산","마들","노원","중계","하계","공릉","태릉입구","먹골","중화","상봉","면목","사가정","용마산","중곡","군자","어린이대공원","건대입구","뚝섬유원지","청담","강남구청","학동","논현","반포","고속터미널","내방","이수","남성","숭실대입구","상도","장승배기","신대방삼거리","보라매","신풍","대림","남구로","가산디지털단지","철산","광명사거리","천왕","온수","까치울","부천종합운동장","춘의","신중동","부천시청","상동","삼산체육관","굴포천","부평구청"
];

// Line 8
const line8Stations = [
  "암사","천호","강동구청","몽촌토성","잠실","석촌","송파","가락시장","문정","장지","복정","남위례","산성","남한산성입구","단대오거리","신흥","수진","모란"
];

// Line 9
const line9Stations = [
  "개화","김포공항","공항시장","신방화","마곡나루","양천향교","가양","증미","등촌","염창","신목동","선유도","당산","국회의사당","여의도","샛강","노량진","노들","흑석","동작","구반포","신반포","고속터미널","사평","신논현","언주","선정릉","삼성중앙","봉은사","종합운동장","삼전","석촌고분","석촌","송파나루","한성백제","올림픽공원","둔촌오륜","중앙보훈병원"
];

// Helper to add graph edges
function addEdge(a: string, b: string) {
  if (!SUBWAY_GRAPH[a]) SUBWAY_GRAPH[a] = [];
  if (!SUBWAY_GRAPH[b]) SUBWAY_GRAPH[b] = [];
  if (!SUBWAY_GRAPH[a].includes(b)) SUBWAY_GRAPH[a].push(b);
  if (!SUBWAY_GRAPH[b].includes(a)) SUBWAY_GRAPH[b].push(a);
}

function addLineEdges(stations: string[], lineNum: string) {
  for (let i = 0; i < stations.length - 1; i++) {
    addEdge(`${stations[i]}::${lineNum}`, `${stations[i+1]}::${lineNum}`);
  }
}

// Add line connections
addLineEdges(line1Stations, "1");
addLineEdges(line1Branch, "1");
addLineEdges(line2Stations, "2");
// 2호선 is circular: connect last to first
addEdge(`충정로::2`, `시청::2`);
addLineEdges(line3Stations, "3");
addLineEdges(line4Stations, "4");
addLineEdges(line5StationsMain, "5");
addLineEdges(line5BranchA, "5");
addLineEdges(line5BranchB, "5");
addLineEdges(line6Stations, "6");
// 6호선 loop
addEdge(`응암::6`, `화랑대::6`);
addLineEdges(line7Stations, "7");
addLineEdges(line8Stations, "8");
addLineEdges(line9Stations, "9");

// Add transfer connections (same station, different lines)
const TRANSFER_STATIONS: Array<[string, string][]> = [
  // 시청 1,2
  [["시청","1"],["시청","2"]],
  // 종로3가 1,3,5
  [["종로3가","1"],["종로3가","3"]],
  [["종로3가","1"],["종로3가","5"]],
  [["종로3가","3"],["종로3가","5"]],
  // 동대문 1,4
  [["동대문","1"],["동대문","4"]],
  // 서울역 1,4
  [["서울역","1"],["서울역","4"]],
  // 신도림 1,2
  [["신도림","1"],["신도림","2"]],
  // 창동 1,4
  [["창동","1"],["창동","4"]],
  // 을지로3가 2,3
  [["을지로3가","2"],["을지로3가","3"]],
  // 을지로4가 2,5
  [["을지로4가","2"],["을지로4가","5"]],
  // 동대문역사문화공원 2,4,5
  [["동대문역사문화공원","2"],["동대문역사문화공원","4"]],
  [["동대문역사문화공원","2"],["동대문역사문화공원","5"]],
  [["동대문역사문화공원","4"],["동대문역사문화공원","5"]],
  // 충정로 2,5
  [["충정로","2"],["충정로","5"]],
  // 왕십리 2,5
  [["왕십리","2"],["왕십리","5"]],
  // 성수 2 branch (not needed for main)
  // 교대 2,3
  [["교대","2"],["교대","3"]],
  // 사당 2,4
  [["사당","2"],["사당","4"]],
  // 고속터미널 3,7,9
  [["고속터미널","3"],["고속터미널","7"]],
  [["고속터미널","3"],["고속터미널","9"]],
  [["고속터미널","7"],["고속터미널","9"]],
  // 충무로 3,4
  [["충무로","3"],["충무로","4"]],
  // 약수 3,6
  [["약수","3"],["약수","6"]],
  // 이수 4,7
  [["이수","4"],["이수","7"]],
  // 동작 4,9
  [["동작","4"],["동작","9"]],
  // 삼각지 4,6
  [["삼각지","4"],["삼각지","6"]],
  // 공덕 5,6
  [["공덕","5"],["공덕","6"]],
  // 신당 2,6
  [["신당","2"],["신당","6"]],
  // 동묘앞 1,6
  [["동묘앞","1"],["동묘앞","6"]],
  // 청구 5,6
  [["청구","5"],["청구","6"]],
  // 군자 5,7
  [["군자","5"],["군자","7"]],
  // 건대입구 2,7
  [["건대입구","2"],["건대입구","7"]],
  // 천호 5,8
  [["천호","5"],["천호","8"]],
  // 합정 2,6
  [["합정","2"],["합정","6"]],
  // 강동 5,8 (via 가락시장 indirect - separate)
  // 노원 4,7
  [["노원","4"],["노원","7"]],
  // 도봉산 1,7
  [["도봉산","1"],["도봉산","7"]],
  // 태릉입구 6,7
  [["태릉입구","6"],["태릉입구","7"]],
  // 잠실 2,8
  [["잠실","2"],["잠실","8"]],
  // 가락시장 3,8
  [["가락시장","3"],["가락시장","8"]],
  // 대림 2,7
  [["대림","2"],["대림","7"]],
  // 당산 2,9
  [["당산","2"],["당산","9"]],
  // 여의도 5,9
  [["여의도","5"],["여의도","9"]],
  // 노량진 1,9
  [["노량진","1"],["노량진","9"]],
  // 종합운동장 2,9
  [["종합운동장","2"],["종합운동장","9"]],
  // 석촌 8,9
  [["석촌","8"],["석촌","9"]],
  // 가산디지털단지 1,7
  [["가산디지털단지","1"],["가산디지털단지","7"]],
  // 김포공항 5,9
  [["김포공항","5"],["김포공항","9"]],
  // 온수 1,7
  [["온수","1"],["온수","7"]],
];

for (const group of TRANSFER_STATIONS) {
  for (const [stA, lineA] of group) {
    for (const [stB, lineB] of group) {
      if (lineA !== lineB) {
        addEdge(`${stA}::${lineA}`, `${stB}::${lineB}`);
      }
    }
  }
}

// Enrich stations with transfer line info
const transferMap: Record<string, string[]> = {};
for (const group of TRANSFER_STATIONS) {
  for (const [stName, lineNum] of group) {
    const key = `${stName}::${lineNum}`;
    if (!transferMap[key]) transferMap[key] = [];
    for (const [otherSt, otherLine] of group) {
      if (otherLine !== lineNum && !transferMap[key].includes(otherLine)) {
        transferMap[key].push(otherLine);
      }
    }
  }
}

for (const station of ALL_STATIONS) {
  const key = `${station.name}::${station.lineNumber}`;
  if (transferMap[key]) {
    station.transferLines = transferMap[key];
  }
}

// BFS pathfinding
export function findShortestPath(from: string, to: string): null | { path: string[]; totalStations: number } {
  // Find all nodes matching from/to station names
  const startNodes = Object.keys(SUBWAY_GRAPH).filter(k => k.startsWith(`${from}::`));
  const endNodes = new Set(Object.keys(SUBWAY_GRAPH).filter(k => k.startsWith(`${to}::`)));

  if (startNodes.length === 0 || endNodes.size === 0) return null;

  const visited = new Set<string>();
  const queue: { node: string; path: string[] }[] = startNodes.map(n => ({ node: n, path: [n] }));

  for (const start of startNodes) {
    visited.add(start);
  }

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (endNodes.has(node)) {
      return { path, totalStations: path.length };
    }
    for (const neighbor of (SUBWAY_GRAPH[node] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }
  return null;
}

export function getStationsByName(name: string): StationInfo[] {
  return ALL_STATIONS.filter(s => s.name === name);
}

export function searchStations(query: string, lineFilter?: string): StationInfo[] {
  let results = ALL_STATIONS;
  if (lineFilter) {
    results = results.filter(s => s.lineNumber === lineFilter || s.line.includes(lineFilter));
  }
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s => s.name.toLowerCase().includes(q));
  }
  // Deduplicate by name+line
  const seen = new Set<string>();
  return results.filter(s => {
    const key = `${s.name}-${s.lineNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
