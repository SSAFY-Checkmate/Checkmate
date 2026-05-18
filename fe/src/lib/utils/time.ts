/**
 * [시간 포맷팅] 초 단위를 MM:SS 또는 HH:MM:SS 형식의 문자열로 변환합니다.
 */
export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * [시간 파싱] HH:MM:SS 또는 MM:SS 형식의 문자열을 초 단위 숫자로 변환합니다.
 */
export const parseTime = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return null;
};

/**
 * [시간 입력 자동 포맷팅]
 * 사용자의 입력에 따라 숫자를 추출하고 자동으로 콜론(:)을 삽입하며, 분/초가 59를 넘지 않도록 보정합니다.
 */
export const formatTimeInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  const limited = digits.slice(0, 6);

  if (limited.length <= 2) {
    return parseInt(limited, 10) > 59 ? "59" : limited;
  } else if (limited.length <= 4) {
    const rawS = limited.slice(-2);
    const rawM = limited.slice(0, limited.length - 2);
    const s = parseInt(rawS, 10) > 59 ? "59" : rawS;
    const m = parseInt(rawM, 10) > 59 ? "59" : rawM;
    return `${m}:${s}`;
  } else {
    const rawS = limited.slice(-2);
    const rawM = limited.slice(-4, -2);
    const rawH = limited.slice(0, limited.length - 4);
    const s = parseInt(rawS, 10) > 59 ? "59" : rawS;
    const m = parseInt(rawM, 10) > 59 ? "59" : rawM;
    return `${rawH}:${m}:${s}`;
  }
};

/**
 * [시간 입력 정규화]
 * 사용자가 입력을 마쳤을 때(Blur), 입력된 값에 따라 단위를 완성합니다.
 * 예: 52 -> 52:00, 1 -> 1:00:00
 */
export const normalizeTime = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  
  if (digits.length === 1) {
    // 1자리 -> 1:00:00
    return `${digits}:00:00`;
  } else if (digits.length === 2) {
    // 2자리 -> 52:00
    return `${digits}:00`;
  }
  
  // 그 외에는 기존 포맷팅 유지
  return formatTimeInput(value);
};
