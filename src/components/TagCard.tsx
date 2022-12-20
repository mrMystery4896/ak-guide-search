import { Tag } from "@prisma/client";

interface TagProps {
  tag: Tag;
}

const TagCard: React.FC<TagProps> = ({ tag }) => {
  return (
    <div className="rounded-md bg-primary py-1 px-2">
      <p className="text-sm">{tag.name}</p>
    </div>
  );
};

export default TagCard;
