import { Guide, Stage, Tag, Creator } from "@prisma/client";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { User } from "next-auth";
import Button from "../../components/Button";
import OperatorTable from "../../components/OperatorTable";
import { prisma } from "../../server/db/client";
import { OperatorWithDetails } from "../../utils/common-types";
import { AiFillYoutube } from "react-icons/ai";
import { IoFlag } from "react-icons/io5";
import { useRouter } from "next/router";

type GuideWithDetails = Guide & {
  stage: Stage;
  guideOperator: OperatorWithDetails[];
  tags: Tag[];
  submittedBy: User;
  uploadedBy: Creator;
};
interface GuidePageProps {
  guide: GuideWithDetails;
}

const guidePage: NextPage<GuidePageProps> = ({ guide }) => {
  const router = useRouter();

  return (
    <>
      <h1 className="mt-4 truncate text-3xl font-bold">{guide.title}</h1>
      <div className="mt-4 flex flex-col gap-4 md:flex-row xl:gap-8">
        <div className="w-full md:w-96">
          <div className="relative h-0 pb-[56.25%]">
            <iframe
              src={`https://www.youtube.com/embed/${guide.id}`}
              className="absolute top-0 left-0 h-full w-full"
              title={guide.title}
              allowFullScreen={true}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="grid h-fit w-auto grid-cols-[150px_auto] gap-3 overflow-x-scroll whitespace-nowrap scrollbar-none">
            <b>Uploaded By</b>
            <p>{guide.uploadedBy.name}</p>
            <b>Submitted By</b>
            <p>{guide.submittedBy.name}</p>
            <b>Submitted On</b>
            <p>
              {new Intl.DateTimeFormat("en-uk", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(guide.submittedAt))}
            </p>
            <b>Stage</b>
            <p>
              {guide.stage.stageCode ? guide.stage.stageCode + " - " : ""}
              {guide.stage.stageName}
            </p>
          </div>
          <div className="mt-4 flex gap-4 lg:gap-6">
            <Button
              onClick={() =>
                window.open(
                  `https://www.youtube.com/watch?v=${guide.id}`,
                  "_blank"
                )
              }
            >
              <div className="flex items-center gap-2 align-middle">
                <AiFillYoutube className="h-6 w-6" />
                YouTube
              </div>
            </Button>
            <Button onClick={() => router.push("/report")} className="bg-red">
              <div className="flex items-center gap-2">
                <IoFlag className="h-5 w-5" />
                Report
              </div>
            </Button>
          </div>
        </div>
      </div>
      <h2 className="mt-5 text-2xl font-bold lg:mt-10">Operators</h2>
      <OperatorTable selectedOperators={guide.guideOperator} />
    </>
  );
};

export default guidePage;

export const getStaticPaths: GetStaticPaths = async () => {
  const guides = await prisma?.guide.findMany();

  if (!guides) return { paths: [], fallback: false };

  const paths = guides.map((guide) => ({
    params: { guideId: guide.id },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const guide = await prisma?.guide.findUnique({
    where: { id: params?.guideId as string },
    include: {
      guideOperator: {
        include: {
          operator: true,
        },
      },
      stage: true,
      submittedBy: true,
      tags: true,
      uploadedBy: true,
    },
  });

  if (!guide) return { notFound: true };

  const formattedGuide = {
    ...guide,
    guideOperator: guide.guideOperator.map(
      (guideOperator) =>
        ({
          ...guideOperator.operator,
          ...guideOperator,
        } as OperatorWithDetails)
    ),
  };

  return {
    props: {
      guide: JSON.parse(JSON.stringify(formattedGuide)),
    },
    revalidate: 10,
  };
};
