import { motion, AnimatePresence } from "framer-motion";
import { PixelButton } from "./pixel-button";
import { AlertCircle } from "lucide-react";

interface PixelAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  type?: "error" | "warning" | "info";
}

const PIXEL_FONT = "'CheckmatePixel', 'DungGeunMo', 'Courier New', monospace";

export const PixelAlertModal = ({
  isOpen,
  onClose,
  title = "알림",
  message,
  buttonText = "확인",
  type = "error",
}: PixelAlertModalProps) => {
  const getTheme = () => {
    switch (type) {
      case "error": return { color: "#ef4444", btnColor: "error" as const };
      case "warning": return { color: "#f59e0b", btnColor: "neutral" as const };
      default: return { color: "#3b82f6", btnColor: "primary" as const };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483647,
            padding: "20px",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "320px",
              backgroundColor: "#ffffff",
              border: "4px solid #475569",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontFamily: PIXEL_FONT,
              boxShadow: "8px 8px 0 rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertCircle size={24} color={theme.color} strokeWidth={3} />
              <h3 style={{ margin: 0, fontSize: "18px", color: "#334155", fontWeight: "bold" }}>
                {title}
              </h3>
            </div>
            <div style={{ height: "2px", backgroundColor: "#f1f5f9", width: "100%" }} />

            {/* Content */}
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#475569",
                lineHeight: "1.6",
                wordBreak: "keep-all",
                textAlign: "center",
                padding: "10px 0"
              }}
            >
              {message}
            </p>

            {/* Action */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
              <div style={{ width: "120px" }}>
                <PixelButton
                  text={buttonText}
                  colorType={theme.btnColor}
                  size="sm"
                  onClick={onClose}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
