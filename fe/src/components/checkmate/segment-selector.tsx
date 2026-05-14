import React, { useState, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Clock, AlertTriangle } from "lucide-react";
import { PixelTooltip } from "../common/pixel-tooltip";

type SegmentSelectorProps = {
  pixelFont: string;
  analysisStatus: string;
};

export interface SegmentSelectorRef {
  getSegmentData: () => {
    useSegment: boolean;
    start: number | null;
    end: number | null;
    error: string | null;
  };
}

/**
 * 특정 구간 분석 설정 컴포넌트
 */
export const SegmentSelector = forwardRef<SegmentSelectorRef, SegmentSelectorProps>(
  ({ pixelFont, analysisStatus }, ref) => {
    const [useSegment, setUseSegment] = useState(false);
    const [startInput, setStartInput] = useState("");
    const [endInput, setEndInput] = useState("");
    const [inputError, setInputError] = useState<string | null>(null);

    // 시간 포맷팅 (초 -> MM:SS)
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0)
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // 시간 파싱 (MM:SS -> 초)
    const parseTime = (timeStr: string) => {
      if (!timeStr) return null;
      const parts = timeStr.split(":");
      if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      if (parts.length === 3)
        return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
      const num = parseInt(timeStr, 10);
      return isNaN(num) ? null : num;
    };

    // 현재 영상 시간 가져오기 로직
    const handleGetCurrentTime = (type: "start" | "end") => {
      const video = document.querySelector("video");
      if (video) {
        const currentTime = Math.floor(video.currentTime);
        const formatted = formatTime(currentTime);
        if (type === "start") setStartInput(formatted);
        else setEndInput(formatted);
        setInputError(null);
      }
    };

    // 부모 컴포넌트에서 호출할 데이터 추출 메서드
    useImperativeHandle(ref, () => ({
      getSegmentData: () => {
        if (!useSegment) {
          return { useSegment: false, start: null, end: null, error: null };
        }

        const parsedStart = parseTime(startInput) || 0;
        const parsedEnd = parseTime(endInput) || 0;

        if (parsedStart > parsedEnd && parsedEnd !== 0) {
          const error = "시작 시간이 종료 시간보다 늦을 수 없습니다.";
          setInputError(error);
          return { useSegment: true, start: parsedStart, end: parsedEnd, error };
        }
        if (parsedStart === 0 && parsedEnd === 0) {
          const error = "분석할 구간을 올바르게 입력해주세요.";
          setInputError(error);
          return { useSegment: true, start: parsedStart, end: parsedEnd, error };
        }

        return { useSegment: true, start: parsedStart, end: parsedEnd, error: null };
      },
    }));

    if (analysisStatus !== "idle") return null;

    return (
      <div
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "2px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            {/* [커스텀 픽셀 체크박스] */}
            <div
              onClick={() => {
                setUseSegment(!useSegment);
                setInputError(null);
              }}
              style={{
                width: "18px",
                height: "18px",
                border: `2px solid ${useSegment ? "#0ea5e9" : "#cbd5e1"}`,
                backgroundColor: useSegment ? "#0ea5e9" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.1s ease",
                boxShadow: useSegment ? "0 2px 0 #0284c7" : "0 2px 0 #e2e8f0",
              }}
            >
              {useSegment && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}
            </div>
            <span style={{ fontSize: "14px", fontWeight: "900", color: "#1e293b", fontFamily: pixelFont }}>
              특정 구간만 분석하기
            </span>
          </label>

          <PixelTooltip
            position="left"
            yOffset={-20}
            content="영상의 재생 바를 조작한 후 [⏱️] 버튼을 누르면 시간이 자동 입력됩니다."
          >
            <div style={{ color: "#94a3b8", cursor: "help" }}>
              <HelpCircle size={16} />
            </div>
          </PixelTooltip>
        </div>

        <AnimatePresence>
          {useSegment && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: "8px" }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              style={{ overflow: "hidden", paddingBottom: "4px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                {/* 시작 시간 */}
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <input
                      type="text"
                      value={startInput}
                      onChange={(e) => {
                        setStartInput(e.target.value);
                        if (inputError) setInputError(null);
                      }}
                      placeholder="시작(00:00:00)"
                        style={{
                          width: "100%",
                          height: "32px",
                          padding: "0 6px",
                          borderRadius: "6px",
                          border: "2px solid #cbd5e1",
                          textAlign: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          fontFamily: pixelFont,
                          boxSizing: "border-box",
                        }}
                    />
                    <button
                      onClick={() => handleGetCurrentTime("start")}
                      style={{
                        width: "32px",
                        height: "30px",
                        backgroundColor: "#0ea5e9",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 0 #0284c7",
                        transition: "all 0.05s",
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "translateY(1px)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 0 #0284c7";
                      }}
                    >
                      <Clock size={16} />
                    </button>
                  </div>
                </div>

                <span style={{ fontWeight: "900", color: "#94a3b8", marginBottom: "8px" }}>~</span>

                {/* 종료 시간 */}
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <input
                      type="text"
                      value={endInput}
                      onChange={(e) => {
                        setEndInput(e.target.value);
                        if (inputError) setInputError(null);
                      }}
                      placeholder="종료(00:00:00)"
                        style={{
                          width: "100%",
                          height: "32px",
                          padding: "0 6px",
                          borderRadius: "6px",
                          border: "2px solid #cbd5e1",
                          textAlign: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          fontFamily: pixelFont,
                          boxSizing: "border-box",
                        }}
                    />
                    <button
                      onClick={() => handleGetCurrentTime("end")}
                      style={{
                        width: "32px",
                        height: "30px",
                        backgroundColor: "#0ea5e9",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 0 #0284c7",
                        transition: "all 0.05s",
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "translateY(1px)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 0 #0284c7";
                      }}
                    >
                      <Clock size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 에러 메시지 표시 */}
              {inputError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: "6px",
                    color: "#ef4444",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>{inputError}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

SegmentSelector.displayName = "SegmentSelector";
