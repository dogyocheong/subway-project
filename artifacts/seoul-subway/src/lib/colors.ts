export const LINE_COLORS: Record<string, string> = {
  "1호선": "#0052A4",
  "2호선": "#00A84D",
  "3호선": "#EF7C1C",
  "4호선": "#00A5DE",
  "5호선": "#996CAC",
  "6호선": "#CD7C2F",
  "7호선": "#747F00",
  "8호선": "#E6186C",
  "9호선": "#BDB092",
  "경의중앙선": "#77C4A3",
  "공항철도": "#0090D2",
  "수인분당선": "#77C4A3",
  "신분당선": "#FABE00"
};

export const getLineColor = (lineName: string): string => {
  return LINE_COLORS[lineName] || "#999999";
};
