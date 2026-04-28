/**
 * [Checkmate 디자인 시스템 - ad-check 오리지널 픽셀 스타일]
 */

export const COLORS = {
  primary: "#3b82f6", // oklch(0.55 0.18 250) 근사치
  primaryForeground: "#ffffff",
  border: "#e2e8f0", // oklch(0.88 0.02 220) 근사치
  background: "#ffffff",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  destructive: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

export const PIXEL_STYLES = {
  // ad-check 오리지널 .pixel-border
  border: {
    backgroundColor: "white",
    imageRendering: "pixelated" as const,
    boxShadow: `
      0 2px 0 0 ${COLORS.border},
      0 -2px 0 0 ${COLORS.border},
      2px 0 0 0 ${COLORS.border},
      -2px 0 0 0 ${COLORS.border}
    `,
  },

  // ad-check 오리지널 .pixel-btn
  btnBase: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%", // 버튼을 부모 너비에 꽉 차게 설정
    imageRendering: "pixelated" as const,
    boxShadow: `
      2px 2px 0 0 rgba(0,0,0,0.3),
      inset -2px -2px 0 0 rgba(0,0,0,0.2),
      inset 2px 2px 0 0 rgba(255,255,255,0.3)
    `,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
  },

  // ad-check 오리지널 .pixel-btn:active
  btnActive: {
    boxShadow: `
      inset 2px 2px 0 0 rgba(0,0,0,0.2),
      inset -2px -2px 0 0 rgba(255,255,255,0.3)
    `,
    transform: "translate(1px, 1px)",
  },

  scrollbar: `
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 0; }
  `,

  dashboardContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: "100%",
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    marginBottom: "24px",
  },

  mainCard: {
    width: "100%",
    margin: "0 0 0 0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "white",
    transition: "all 0.3s ease",
  },

  warningHeader: (gradient: string) => ({
    padding: "24px 0 16px 0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: gradient,
    borderBottom: "2px solid rgba(0,0,0,0.1)",
  }),

  warningIconContainer: {
    padding: "8px",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: "8px",
    marginBottom: "12px",
  },
};
