import { GetServerSideProps, type NextPage } from "next";
import { trpc } from "../utils/trpc";
import GuideCard from "../components/GuideCard";
import { Creator, Guide, Operator, Tag } from "@prisma/client";
import { prisma } from "../server/db/client";

interface HomeProps {
  recentGuides:
    | (Guide & {
        operators: Operator[];
        uploadedBy: Creator;
        tags: Tag[];
      })[]
    | undefined;
}

const Home: NextPage<HomeProps> = ({ recentGuides }) => {
  return (
    <>
      <h2 className="mb-2 text-2xl font-bold">Recently Added</h2>
      <div className="flex min-w-full flex-col gap-2 md:gap-4">
        {recentGuides?.map((guide) => {
          return <GuideCard guide={guide} key={guide.id} />;
        })}
      </div>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await prisma.guide.findMany({
    where: {
      status: "APPROVED",
    },
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      operators: true,
      uploadedBy: true,
      tags: true,
    },
    take: 3,
  });

  return {
    props: {
      recentGuides: JSON.parse(JSON.stringify(data)),
    },
  };
};
