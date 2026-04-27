/**
 * [Checkmate 디자인 시스템 - 픽셀 아트 인라인 스타일 상수]
 * index.css의 복잡한 box-shadow 및 디자인 규칙을 JS 객체로 이식했습니다.
 */

export const PIXEL_STYLES = {
  // 1. 기본 픽셀 테두리
  border: {
    imageRendering: "pixelated" as const,
    boxShadow: `
      0 2px 0 0 #000,
      0 -2px 0 0 #000,
      2px 0 0 0 #000,
      -2px 0 0 0 #000
    `,
    border: "none",
  },

  // 2. 안쪽 그림자가 있는 픽셀 테두리 (탭/카드용)
  borderIn: {
    imageRendering: "pixelated" as const,
    boxShadow: `
      inset -2px -2px 0 0 rgba(0, 0, 0, 0.1),
      2px 2px 0 0 rgba(0, 0, 0, 0.05),
      0 2px 0 0 #000,
      0 -2px 0 0 #000,
      2px 0 0 0 #000,
      -2px 0 0 0 #000
    `,
    border: "none",
  },

  // 3. 버튼 베이스 스타일
  btnBase: {
    imageRendering: "pixelated" as const,
    border: "none",
    fontFamily: "var(--font-pixel)",
    fontWeight: "bold",
    transition: "all 0.1s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  },

  // 4. 버튼 상태별 그림자 (JS 이벤트 핸들러용)
  btnShadow: {
    default: "3px 3px 0 0 rgba(0, 0, 0, 0.2)",
    hover: "4px 4px 0 0 rgba(0, 0, 0, 0.2)",
    active: "none",
  },

  // 5. 색상별 버튼 스타일
  btnColors: {
    blue: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      boxShadow: "3px 3px 0 0 #1d4ed8",
    },
    purple: {
      backgroundColor: "#8b5cf6",
      color: "#ffffff",
      boxShadow: "3px 3px 0 0 #6d28d9",
    },
    yellow: {
      backgroundColor: "#fde047",
      color: "#000000",
      boxShadow: "3px 3px 0 0 #ca8a04",
    },
  },

  // 6. 스크롤바 스타일 (CSS 변수 활용 권장)
  scrollbar: `
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 0; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `,
};
