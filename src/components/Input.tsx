import React, { Ref } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ errorMessage, className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <input
          className={twMerge(
            `rounded-md border border-gray-300 bg-gray-300 px-3 py-1 text-sm placeholder:text-sm placeholder:text-gray-100 focus:outline-none md:py-2 md:text-base placeholder:md:text-base ${
              errorMessage ? "border-red" : "focus:border-primary"
            }`,
            className
          )}
          ref={ref}
          {...props}
        />
        <span className={`text-sm text-red ${errorMessage ? "" : "invisible"}`}>
          {errorMessage}
        </span>
        {/* {errorMessage && (
          <span className="text-sm text-red">{errorMessage}</span>
        )} */}
      </div>
    );
  }
);

export default Input;
