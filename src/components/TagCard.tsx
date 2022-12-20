import { Tag } from "@prisma/client";

interface TagProps {
  tag: Tag;
}

const TagCard: React.FC<TagProps> = ({ tag }) => {
  return (
    <div className="rounded-md bg-primary py-1 px-2 xl:py-2 xl:px-4">
      <p className="text-xs md:text-sm xl:text-base xl:font-semibold">
        {tag.name}
      </p>
    </div>
  );
};

export default TagCard;
