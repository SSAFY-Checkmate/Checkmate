import React, { useState, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Clock, AlertTriangle } from "lucide-react";
import { PixelTooltip } from "../common/pixel-tooltip";
import { formatTime, formatTimeInput, normalizeTime, parseTime } from "../../lib/utils/time";

type AnalysisMode = "full" | "range" | "at";

type SegmentSelectorProps = {
  pixelFont: string;
  analysisStatus: string;
};

export interface SegmentSelectorRef {
  getSegmentData: () => {
    useSegment: boolean;
    startSeconds: number | null;
    endSeconds: number | null;
    error: string | null;
  };
}

/**
 * [수사 옵션 설정] 전체 / 구간 / 시점 선택 컴포넌트
 */
export const SegmentSelector = forwardRef<SegmentSelectorRef, SegmentSelectorProps>(
  ({ pixelFont, analysisStatus }, ref) => {
    const [mode, setMode] = useState<AnalysisMode>("full");
    const [startInput, setStartInput] = useState("");
    const [endInput, setEndInput] = useState("");
    const [atInput, setAtInput] = useState("");
    const [inputError, setInputError] = useState<string | null>(null);

    // 현재 영상 시간 가져오기 로직
    const handleGetCurrentTime = (target: "start" | "end" | "at") => {
      const video = document.querySelector("video");
      if (video) {
        const currentTime = Math.floor(video.currentTime);
        const formatted = formatTime(currentTime);
        if (target === "start") setStartInput(formatted);
        else if (target === "end") setEndInput(formatted);
        else setAtInput(formatted);
        setInputError(null);
      }
    };

    // 부모 컴포넌트에서 호출할 데이터 추출 메서드
    useImperativeHandle(ref, () => ({
      getSegmentData: () => {
        if (mode === "full") {
          return { useSegment: false, startSeconds: null, endSeconds: null, error: null };
        }

        const video = document.querySelector("video");
        const duration = video ? Math.floor(video.duration) : Infinity;

        // 1) 시점 분석 (AT)
        if (mode === "at") {
          const parsedAt = parseTime(atInput) || 0;
          if (parsedAt === 0 && atInput !== "00:00:00") {
            const error = "분석 시점을 입력해주세요.";
            setInputError(error);
            return { useSegment: true, startSeconds: 0, endSeconds: 0, error };
          }
          if (parsedAt > duration) {
            const error = `영상 길이(${formatTime(duration)})를 초과했습니다.`;
            setInputError(error);
            return { useSegment: true, startSeconds: parsedAt, endSeconds: parsedAt, error };
          }
          // 시작/종료를 동일하게 설정하여 store에서 AT API 호출 유도
          return { useSegment: true, startSeconds: parsedAt, endSeconds: parsedAt, error: null };
        }

        // 2) 구간 분석 (RANGE)
        const parsedStart = parseTime(startInput) || 0;
        const parsedEnd = parseTime(endInput) || 0;

        if (parsedStart > duration || parsedEnd > duration) {
          const error = `입력한 시간이 영상 길이를 초과합니다.`;
          setInputError(error);
          return { useSegment: true, startSeconds: parsedStart, endSeconds: parsedEnd, error };
        }
        if (parsedStart > parsedEnd && parsedEnd !== 0) {
          const error = "시작 시간이 종료 시간보다 늦을 수 없습니다.";
          setInputError(error);
          return { useSegment: true, startSeconds: parsedStart, endSeconds: parsedEnd, error };
        }
        if (parsedStart === 0 && parsedEnd === 0) {
          const error = "분석 구간을 입력해주세요.";
          setInputError(error);
          return { useSegment: true, startSeconds: parsedStart, endSeconds: parsedEnd, error };
        }

        return { useSegment: true, startSeconds: parsedStart, endSeconds: parsedEnd, error: null };
      },
    }));

    if (analysisStatus !== "idle") return null;

    const tabs: { id: AnalysisMode; label: string }[] = [
      { id: "full", label: "전체 수사" },
      { id: "range", label: "구간 수사" },
      { id: "at", label: "지점 수사" },
    ];

    return (
      <div
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "2px solid #e2e8f0",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        {/* 모드 선택 탭 및 도움말 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "900", color: "#64748b", fontFamily: pixelFont }}>분석 범위 설정</span>
          <PixelTooltip
            position="left"
            yOffset={-10}
            content="수사 범위를 정해주세요. [⏱️] 버튼을 누르면 현재 재생 중인 시간이 입력됩니다."
          >
            <div style={{ color: "#94a3b8", cursor: "help" }}>
              <HelpCircle size={14} />
            </div>
          </PixelTooltip>
        </div>

        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", backgroundColor: "#e2e8f0", padding: "3px", borderRadius: "8px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                setInputError(null);
              }}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: "12px",
                fontWeight: "900",
                fontFamily: pixelFont,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: mode === tab.id ? "white" : "transparent",
                color: mode === tab.id ? "#0ea5e9" : "#64748b",
                boxShadow: mode === tab.id ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "full" ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              style={{ textAlign: "center", padding: "8px 0" }}
            >
              <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", margin: 0 }}>
                영상의 모든 내용을 꼼꼼하게 수사합니다.
              </p>
            </motion.div>
          ) : mode === "range" ? (
            <motion.div
              key="range"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1, display: "flex", gap: "2px" }}>
                  <input
                    type="text"
                    value={startInput}
                    onChange={(e) => setStartInput(formatTimeInput(e.target.value))}
                    onBlur={(e) => setStartInput(normalizeTime(e.target.value))}
                    placeholder="시작(00:00)"
                    style={inputStyle(pixelFont)}
                  />
                  <ClockButton onClick={() => handleGetCurrentTime("start")} />
                </div>
                <span style={{ fontWeight: "900", color: "#cbd5e1" }}>~</span>
                <div style={{ flex: 1, display: "flex", gap: "2px" }}>
                  <input
                    type="text"
                    value={endInput}
                    onChange={(e) => setEndInput(formatTimeInput(e.target.value))}
                    onBlur={(e) => setEndInput(normalizeTime(e.target.value))}
                    placeholder="종료(00:00)"
                    style={inputStyle(pixelFont)}
                  />
                  <ClockButton onClick={() => handleGetCurrentTime("end")} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="at"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <input
                  type="text"
                  value={atInput}
                  onChange={(e) => setAtInput(formatTimeInput(e.target.value))}
                  onBlur={(e) => setAtInput(normalizeTime(e.target.value))}
                  placeholder="수사할 시점 입력 (00:00)"
                  style={{ ...inputStyle(pixelFont), flex: 1 }}
                />
                <ClockButton onClick={() => handleGetCurrentTime("at")} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에러 메시지 */}
        {inputError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: "8px", color: "#ef4444", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <AlertTriangle size={12} />
            <span>{inputError}</span>
          </motion.div>
        )}
      </div>
    );
  },
);

const inputStyle = (font: string): React.CSSProperties => ({
  width: "100%",
  height: "34px", // 32px -> 34px로 상향
  padding: "0 10px",
  borderRadius: "8px",
  border: "2px solid #cbd5e1",
  textAlign: "center",
  fontSize: "12px",
  fontWeight: "bold",
  fontFamily: font,
  boxSizing: "border-box",
  outline: "none",
  backgroundColor: "white",
});

const ClockButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      width: "34px",
      height: "32px", // 그림자(2px)를 포함해 총 34px가 되도록 설정
      backgroundColor: "#0ea5e9",
      color: "white",
      border: "none",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 2px 0 #0284c7", // 2px 그림자
      transition: "all 0.05s",
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = "translateY(1px)";
      e.currentTarget.style.boxShadow = "0 1px 0 #0284c7"; // 눌렸을 때 그림자도 줄임
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 0 #0284c7";
    }}
  >
    <Clock size={16} />
  </button>
);

SegmentSelector.displayName = "SegmentSelector";
