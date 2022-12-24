import { CgSpinner } from "react-icons/cg";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return <CgSpinner className={twMerge("animate-spin text-3xl ", className)} />;
};

export default LoadingSpinner;
