import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  visible: boolean;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible = false,
  duration,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 1000 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
          exit={{ x: 1000 }}
          className={`relative rounded-md bg-gray-500 px-4 py-2`}
        >
          <p>{message}</p>
          <motion.div
            className={`absolute bottom-0 right-0 h-1 w-full rounded ${
              type === "success" ? "bg-2-star" : "bg-red"
            }`}
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{
              duration: duration ? duration / 1000 : 1,
              ease: "linear",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
