// ゴルフ関連定数

export const DEFAULT_PAR = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5] as const;

export const WEATHER_LABELS: Record<string, string> = {
  SUNNY: "晴れ",
  CLOUDY: "曇り",
  RAINY: "雨",
  WINDY: "強風",
};

export const WIND_LABELS: Record<string, string> = {
  CALM: "無風",
  LIGHT: "微風",
  MODERATE: "やや強い",
  STRONG: "強風",
};

export const FAIRWAY_LABELS: Record<string, string> = {
  HIT: "フェアウェイ",
  LEFT: "左",
  RIGHT: "右",
  SHORT: "ショート",
  LONG: "オーバー",
};

export const MISS_TYPE_LABELS: Record<string, string> = {
  SLICE: "スライス",
  HOOK: "フック",
  DUFF: "ダフリ",
  TOP: "トップ",
  SHANK: "シャンク",
  PUSH: "プッシュ",
  PULL: "引っかけ",
  FAT: "ダフリ(アプローチ)",
  THIN: "トップ(アプローチ)",
  THREE_PUTT: "3パット",
  OTHER: "その他",
};

export const PRACTICE_LOCATION_LABELS: Record<string, string> = {
  DRIVING_RANGE: "打ちっぱなし",
  INDOOR_GOLF: "インドアゴルフ",
  PUTTING_GREEN: "パター練習場",
  APPROACH_AREA: "アプローチ練習場",
  HOME: "自宅",
  COURSE: "コース",
  OTHER: "その他",
};

export const PRACTICE_CATEGORY_LABELS: Record<string, string> = {
  DRIVER: "ドライバー",
  WOOD: "フェアウェイウッド",
  UTILITY: "ユーティリティ",
  LONG_IRON: "ロングアイアン",
  MID_IRON: "ミドルアイアン",
  SHORT_IRON: "ショートアイアン",
  WEDGE: "ウェッジ",
  APPROACH: "アプローチ",
  BUNKER: "バンカー",
  PUTTING: "パッティング",
  SWING_DRILL: "スイングドリル",
  FITNESS: "フィジカル",
  OTHER: "その他",
};
