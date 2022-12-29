import Tippy from "@tippyjs/react/headless";
import { MdInfo } from "react-icons/md";

const Tooltip: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Tippy
      render={(attrs) => (
        <div
          className="absolute left-5 rounded-md bg-gray-300 p-2 text-sm drop-shadow-md"
          {...attrs}
        >
          {content}
        </div>
      )}
    >
      <div>
        <MdInfo className="ml-2 h-4 w-4" />
      </div>
    </Tippy>
  );
};

export default Tooltip;
