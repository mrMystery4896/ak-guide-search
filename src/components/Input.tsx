import React, { Ref } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string;
  label?: string;
  inputDivClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      errorMessage,
      inputDivClassName,
      label,
      className,
      type,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={twMerge(
          "relative mb-4 flex flex-col md:mb-5",
          inputDivClassName
        )}
      >
        {label && (
          <label
            className="mb-1 text-xs text-slate-200 md:text-sm"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <input
          className={twMerge(
            `rounded-md border-2 ${
              disabled
                ? "border-gray-300/50 bg-gray-300/50 text-white/50 placeholder:text-gray-100/50"
                : "border-gray-300 bg-gray-300 text-white placeholder:text-gray-100"
            } px-3 py-2 text-sm placeholder:text-sm focus:outline-none md:py-2 md:text-base placeholder:md:text-base ${
              errorMessage ? "border-red" : "focus:border-primary"
            }`,
            className
          )}
          ref={ref}
          type={type}
          onWheel={
            type === "number" ? (e) => e.currentTarget.blur() : undefined
          }
          disabled={disabled}
          {...props}
        />
        <span
          className={`absolute -bottom-5 h-5 text-sm font-semibold text-red ${
            errorMessage ? "" : "invisible"
          }`}
        >
          {errorMessage}
        </span>
      </div>
    );
  }
);

export default Input;
