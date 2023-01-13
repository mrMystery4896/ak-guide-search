import { GetServerSideProps, type NextPage } from "next";
import { motion, Variants } from "framer-motion";
import GuideCard from "../components/GuideCard";
import { Creator, Guide, GuideOperator, Operator, Tag } from "@prisma/client";
import { prisma } from "../server/db/client";

interface HomeProps {
  recentGuides: (Guide & {
    guideOperator: (GuideOperator & {
      operator: {
        id: string;
        name: string;
        rarity: number;
      };
    })[];
    tags: Tag[];
    uploadedBy: Creator;
  })[];
}

const guideCards: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      staggerDirection: 1,
    },
  },
  hidden: {
    opacity: 0,
    y: 10,
    transition: {
      when: "afterChildren",
    },
  },
};

const Home: NextPage<HomeProps> = ({ recentGuides }) => {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-2xl font-bold"
      >
        Recently Added
      </motion.h2>
      <motion.div
        variants={guideCards}
        initial="hidden"
        animate="visible"
        className="flex min-w-full flex-col gap-2 md:gap-4"
      >
        {recentGuides?.map((guide) => {
          return <GuideCard guide={guide} key={guide.id} />;
        })}
      </motion.div>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await prisma.guide.findMany({
    include: {
      guideOperator: {
        include: {
          operator: {
            select: {
              name: true,
              rarity: true,
              id: true,
            },
          },
        },
      },
      uploadedBy: true,
      tags: true,
    },
    where: {
      status: "APPROVED",
    },
    orderBy: {
      submittedAt: "desc",
    },
    take: 3,
  });

  return {
    props: {
      recentGuides: JSON.parse(JSON.stringify(data)),
    },
  };
};
