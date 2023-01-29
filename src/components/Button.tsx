import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    { children, isLoading = false, className = "", disabled, ...props },
    ref
  ) => {
    return (
      <motion.button
        className={twMerge(
          "md:px:4 relative flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-white disabled:bg-primary/50 disabled:text-white/50 md:py-2 md:text-base",
          className
        )}
        disabled={disabled || isLoading}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        ref={ref}
        {...props}
      >
        <svg
          className={`absolute top-0 left-0 bottom-0 right-0 m-auto h-3 w-3 animate-spin align-middle text-white md:h-5 md:w-5 ${
            isLoading ? "" : "hidden"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className={`${isLoading ? "invisible" : ""} font-semibold`}>
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
