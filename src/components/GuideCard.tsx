import { Creator, Guide, Operator, Tag } from "@prisma/client";
import Image from "next/image";
import { env } from "../env/client.mjs";
import TagCard from "./TagCard";

interface GuideCardProps {
  guide: Guide & {
    operators: Operator[];
    tags: Tag[];
    uploadedBy: Creator;
  };
}

const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const translateRarityToClassName = (rarity: number) => {
    switch (rarity) {
      case 1:
        return "bg-1-star";
      case 2:
        return "bg-2-star";
      case 3:
        return "bg-3-star";
      case 4:
        return "bg-4-star";
      case 5:
        return "bg-5-star";
      case 6:
        return "bg-6-star";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="relative flex h-[180px] flex-col items-start overflow-hidden rounded-md bg-gray-300 md:flex-row md:rounded-xl xl:h-[270px]">
      <div className="relative h-[180px] min-w-[320px] overflow-hidden xl:h-[270px] xl:min-w-[480px]">
        <Image
          src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/guide-thumbnail/${guide.id}.png`}
          alt={guide.title}
          fill
          style={{
            objectFit: "scale-down",
          }}
          loading="eager"
        />
      </div>
      <div className="flex h-[180px] w-auto flex-col justify-between p-4 xl:h-[270px] xl:justify-start xl:gap-4 xl:p-6">
        <div>
          <h3 className="truncate text-xl font-bold xl:text-2xl">
            {guide.title}
          </h3>
          <h4 className="truncate text-sm lg:text-base">
            Uploaded By: {guide.uploadedBy.name}
          </h4>
        </div>
        <div className="flex gap-2">
          {guide.tags.map((tag) => {
            return <TagCard tag={tag} key={tag.id} />;
          })}
        </div>
        <ul className="flex max-h-10 gap-2 md:gap-3">
          {guide.operators
            .sort((a, b) => b.rarity - a.rarity)
            .map((operator) => {
              return (
                <li
                  key={operator.id}
                  className={
                    `relative h-6 w-6 overflow-hidden rounded-full md:h-10 md:w-10 lg:h-12 lg:w-12` +
                    ` ${translateRarityToClassName(operator.rarity)}`
                  }
                >
                  <Image
                    src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                    alt={operator.id}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default GuideCard;