
interface FormattedExplanationProps {
  text: string;
  mainFont?: string;
}

/**
 * [Checkmate] 분석 소견 텍스트 포맷팅 컴포넌트
 * - 문장 단위 줄바꿈 적용
 * - (출처: ...) 패턴 감지 및 우측 정렬 배지 렌더링
 */
export const FormattedExplanation = ({ text, mainFont }: FormattedExplanationProps) => {
  const fontStyle = mainFont ? { fontFamily: mainFont } : {};

  return (
    <div style={{ ...fontStyle }}>
      {text.split(/(\(출처:[^)]+\))/g).map((part, i) => {
        if (part.startsWith("(출처:")) {
          return (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <span
                style={{
                  color: "#6366f1",
                  fontWeight: "800",
                  backgroundColor: "#eef2ff",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 1px 2px rgba(99, 102, 241, 0.05)",
                }}
              >
                {part}
              </span>
            </div>
          );
        }

        // 마침표 기준으로 문장 나누기 (줄바꿈 적용)
        return (
          <div key={i}>
            {part.split(/(?<=\. )/g).map((sentence, si) => (
              <p key={si} style={{ margin: "0 0 8px 0" }}>
                {sentence.trim()}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};
