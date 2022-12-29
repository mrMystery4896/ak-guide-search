import { Tag } from "@prisma/client";

interface TagProps {
  tag: Tag;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const TagCard: React.FC<TagProps> = ({ tag, onClick }) => {
  return (
    <div
      className={`w-fit rounded-md bg-primary py-1 px-2 xl:py-2 xl:px-4 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <p className="text-xs md:text-sm xl:text-base xl:font-semibold">
        {tag.name}
      </p>
    </div>
  );
};

export default TagCard;
