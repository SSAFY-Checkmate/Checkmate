import { motion, AnimatePresence } from "framer-motion";
import { PixelButton } from "./pixel-button";

interface PixelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "primary";
}

const PIXEL_FONT = "'CheckmatePixel', 'DungGeunMo', 'Courier New', monospace";

export const PixelConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "확인",
  message,
  confirmText = "확인",
  cancelText = "취소",
  type = "danger",
}: PixelConfirmModalProps) => {
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
            zIndex: 9999,
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
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(2px)",
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
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: type === "danger" ? "#ef4444" : "#334155",
                  fontWeight: "bold",
                }}
              >
                {title}
              </h3>
              <div
                style={{
                  height: "2px",
                  backgroundColor: "#e2e8f0",
                  width: "100%",
                }}
              />
            </div>

            {/* Content */}
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#475569",
                lineHeight: "1.6",
                wordBreak: "keep-all",
              }}
            >
              {message}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <div style={{ flex: 1 }}>
                <PixelButton text={cancelText} colorType="neutral" size="sm" onClick={onClose} />
              </div>
              <div style={{ flex: 1 }}>
                <PixelButton
                  text={confirmText}
                  colorType={type === "danger" ? "error" : "primary"}
                  size="sm"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
