import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string;
}

const Input: React.FC<InputProps> = ({
  errorMessage = "",
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <input
        className={twMerge(
          `rounded-md border border-gray-300 bg-gray-300 px-3 py-1 placeholder:text-sm placeholder:text-gray-100 focus:outline-none md:py-2 placeholder:md:text-base ${
            errorMessage ? "border-red" : "focus:border-primary"
          }`,
          className
        )}
        {...props}
      />
      {errorMessage && <span className="text-sm text-red">{errorMessage}</span>}
    </div>
  );
};

export default Input;
