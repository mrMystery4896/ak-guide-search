import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import GuideCard from "../components/GuideCard";
import type { Creator, Guide, GuideOperator, Tag } from "@prisma/client";
// import { Operator } from "@prisma/client";
import { prisma } from "../server/db/client";
import Link from "next/link";

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
          return (
            <motion.div key={guide.id} whileHover={{ y: -2 }}>
              <Link href={`/guides/${guide.id}`}>
                <GuideCard guide={guide} />
              </Link>
            </motion.div>
          );
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
