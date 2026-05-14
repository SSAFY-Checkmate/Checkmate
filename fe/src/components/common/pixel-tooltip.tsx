import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PixelTooltipProps = {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  xOffset?: number;
  yOffset?: number;
};

/**
 * Checkmate 전용 픽셀 스타일 커스텀 툴팁
 */
export const PixelTooltip = ({ 
  content, 
  children, 
  position = "top",
  xOffset = 0,
  yOffset = 0
}: PixelTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    const isVertical = position === "top" || position === "bottom";
    
    // Framer Motion용 초기/대상 좌표 계산
    const baseInitial = {
      top: { x: "-50%", y: "10px", opacity: 0, scale: 0.95 },
      bottom: { x: "-50%", y: "-10px", opacity: 0, scale: 0.95 },
      left: { x: "10px", y: "-50%", opacity: 0, scale: 0.95 },
      right: { x: "-10px", y: "-50%", opacity: 0, scale: 0.95 },
    }[position] || { x: "-50%", y: "10px", opacity: 0, scale: 0.95 };

    const baseAnimate = {
      top: { x: "-50%", y: "0px", opacity: 1, scale: 1 },
      bottom: { x: "-50%", y: "0px", opacity: 1, scale: 1 },
      left: { x: "0px", y: "-50%", opacity: 1, scale: 1 },
      right: { x: "0px", y: "-50%", opacity: 1, scale: 1 },
    }[position] || { x: "-50%", y: "0px", opacity: 1, scale: 1 };

    // 꼬리(Arrow)의 위치 보정 (박스가 이동한 만큼 반대로 이동시켜 센터 유지)
    const arrowTopOffset = isVertical ? "50%" : `calc(50% - ${yOffset}px)`;
    const arrowLeftOffset = isVertical ? `calc(50% - ${xOffset}px)` : "50%";

    const commonArrow = {
      width: isVertical ? "14px" : "8px",
      height: isVertical ? "8px" : "14px",
      top: arrowTopOffset,
      left: arrowLeftOffset,
    };

    switch (position) {
      case "left":
        return {
          right: "100%",
          top: "50%",
          marginRight: "14px",
          initial: baseInitial,
          animate: baseAnimate,
          arrow: {
            ...commonArrow,
            left: "100%",
            transform: "translateY(-50%)",
            innerMarginTop: "0",
            innerMarginLeft: "-6px",
          }
        };
      case "right":
        return {
          left: "100%",
          top: "50%",
          marginLeft: "14px",
          initial: baseInitial,
          animate: baseAnimate,
          arrow: {
            ...commonArrow,
            right: "100%",
            transform: "translateY(-50%)",
            innerMarginTop: "0",
            innerMarginLeft: "4px",
          }
        };
      case "bottom":
        return {
          top: "100%",
          left: "50%",
          marginTop: "14px",
          initial: baseInitial,
          animate: baseAnimate,
          arrow: {
            ...commonArrow,
            bottom: "100%",
            transform: "translateX(-50%)",
            innerMarginTop: "4px",
            innerMarginLeft: "0",
          }
        };
      case "top":
      default:
        return {
          bottom: "100%",
          left: "50%",
          marginBottom: "14px",
          initial: baseInitial,
          animate: baseAnimate,
          arrow: {
            ...commonArrow,
            top: "100%",
            transform: "translateX(-50%)",
            innerMarginTop: "-6px",
            innerMarginLeft: "0",
          }
        };
    }
  };

  const styles = getPositionStyles();

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={styles.initial}
            animate={{
              ...styles.animate,
              x: `calc(${(styles.animate as any).x} + ${xOffset}px)`,
              y: `calc(${(styles.animate as any).y} + ${yOffset}px)`,
            }}
            exit={styles.initial}
            transition={{ duration: 0.1, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: (styles as any).top,
              bottom: (styles as any).bottom,
              left: (styles as any).left,
              right: (styles as any).right,
              marginTop: (styles as any).marginTop || 0,
              marginBottom: (styles as any).marginBottom || 0,
              marginLeft: (styles as any).marginLeft || 0,
              marginRight: (styles as any).marginRight || 0,
              zIndex: 1000,
              width: "max-content",
              maxWidth: "220px",
              padding: "10px 14px",
              backgroundColor: "#1e293b",
              color: "white",
              fontSize: "12px",
              lineHeight: "1.4",
              fontWeight: "900",
              fontFamily: "'CheckmatePixel', sans-serif",
              imageRendering: "pixelated",
              boxShadow: `
                0 2px 0 0 #475569,
                0 -2px 0 0 #475569,
                2px 0 0 0 #475569,
                -2px 0 0 0 #475569,
                4px 4px 0 0 rgba(0,0,0,0.1)
              `,
              pointerEvents: "none",
              wordBreak: "keep-all",
              textAlign: "center",
            }}
          >
            {content}

            {/* Pixel Arrow */}
            <div
              style={{
                position: "absolute",
                top: styles.arrow.top as any,
                bottom: (styles.arrow as any).bottom as any,
                left: styles.arrow.left as any,
                right: (styles.arrow as any).right as any,
                transform: styles.arrow.transform,
                width: styles.arrow.width,
                height: styles.arrow.height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#1e293b",
                  border: "2px solid #475569",
                  transform: "rotate(45deg)",
                  marginTop: styles.arrow.innerMarginTop,
                  marginLeft: styles.arrow.innerMarginLeft,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
