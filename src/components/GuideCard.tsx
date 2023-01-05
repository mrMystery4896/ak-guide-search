import { Creator, Guide, Operator, Tag } from "@prisma/client";
import Image from "next/image";
import { env } from "../env/client.mjs";
import TagCard from "./TagCard";
import { translateRarityToClassName } from "../utils/functions";
import { motion, Variants } from "framer-motion";
import { useMediaQuery } from "react-responsive";

interface GuideCardProps {
  guide: Guide & {
    operators: Operator[];
    tags: Tag[];
    uploadedBy: Creator;
  };
}

const guideCard: Variants = {
  visible: {
    opacity: 1,
    y: 0,
  },
  hidden: {
    opacity: 0,
    y: 10,
  },
};

const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const isXlScreen = useMediaQuery({ query: "(min-width: 1280px)" });

  return (
    <motion.div
      variants={guideCard}
      className="relative flex w-full flex-col items-start overflow-hidden rounded-lg bg-gray-300 md:h-[180px] md:flex-row md:rounded-xl xl:h-[270px]"
    >
      <div className="relative min-w-full overflow-hidden pb-[56%] md:h-[180px] md:min-w-[320px] md:pb-0 xl:h-[270px] xl:min-w-[480px]">
        <Image
          src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/guide-thumbnail/${guide.id}.png`}
          alt={guide.title}
          fill
          style={{
            objectFit: "scale-down",
          }}
          sizes="100%"
          priority={true}
        />
      </div>
      <div className="flex min-h-fit w-auto max-w-full flex-col gap-4 p-4 md:h-[180px] md:w-auto md:max-w-[calc(100%-320px)] md:justify-between xl:h-[270px] xl:max-w-[calc(100%-480px)] xl:justify-start xl:gap-8 xl:p-6">
        <div className="w-full">
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
                    `relative min-h-[40px] min-w-[40px] overflow-hidden rounded-full md:h-10 md:w-10 xl:h-12 xl:w-12` +
                    ` ${translateRarityToClassName(operator.rarity)}`
                  }
                >
                  <Image
                    src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                    alt={operator.id}
                    width={isXlScreen ? 48 : 40}
                    height={isXlScreen ? 48 : 40}
                    style={{ objectFit: "contain" }}
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </motion.div>
  );
};

export default GuideCard;
