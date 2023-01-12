import { Event, Operator, Stage, Tag } from "@prisma/client";
import { GetServerSideProps, type NextPage } from "next";
import Image from "next/image";
import { useRef, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { env } from "../env/client.mjs";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import { HiArrowsUpDown } from "react-icons/hi2";
import Tooltip from "../components/Tooltip";
import SelectOperatorDropdown from "../components/SelectOperatorDropdown";
import { prisma } from "../server/db/client";
import { getEvent, translateRarityToClassName } from "../utils/functions";
import TagCard from "../components/TagCard";
import SelectTagDropdown from "../components/SelectTagDropdown";
import { EventWithChildren } from "../utils/common-types";
import SelectStageMenu from "../components/SelectStageMenu";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Toast from "../components/Toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface SubmitGuideProps {
  operatorList: Operator[];
  tagList: Tag[];
  eventList: EventWithChildren[];
}

const SubmitGuide: NextPage<SubmitGuideProps> = ({
  operatorList,
  tagList,
  eventList,
}) => {
  const videoUrlInputRef = useRef<HTMLInputElement>(null);

  const [selectedOperators, setSelectedOperators] = useState<Operator[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const session = useSession();
  const router = useRouter();

  const {
    data: youtubeData,
    error: youtubeError,
    isLoading: videoIsLoading,
    mutate,
  } = trpc.youtube.getVideo.useMutation();
  const {
    error: submitGuideError,
    mutate: submitGuide,
    isLoading: isSubmitting,
  } = trpc.guide.submitGuide.useMutation({
    onSuccess: () => {
      toast.custom((t) => (
        <Toast
          message={`Guide submitted successfully!${
            session.data?.user?.role === "ADMIN"
              ? " It will show up once a moderator have approved it."
              : ""
          }`}
          visible={t.visible}
          duration={3000}
          type="success"
        />
      ));
      router.push("/");
    },
    onError: (error) => {
      toast.custom((t) => (
        <Toast
          message="Something went wrong. Please try again later."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
    },
  });

  const getVideoDetails = async () => {
    if (!videoUrlInputRef.current) return;
    mutate(videoUrlInputRef.current.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeData) {
      toast.custom((t) => (
        <Toast
          message="Please fetch a video first."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    if (selectedOperators.length === 0) {
      toast.custom((t) => (
        <Toast
          message="Please select at least one operator."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    if (selectedTags.length === 0) {
      toast.custom((t) => (
        <Toast
          message="Please select at least one tag."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    if (!selectedStage) {
      toast.custom((t) => (
        <Toast
          message="Please select a stage."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    submitGuide({
      id: youtubeData.id,
      title: youtubeData.title,
      stageId: selectedStage.id,
      operatorIds: selectedOperators.map((operator) => operator.id),
      tags: selectedTags.map((tag) => tag.id),
      uploadedById: youtubeData.channelId,
      uploadedByName: youtubeData.channelTitle,
      thumbnailUrl: youtubeData.thumbnail,
    });
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Submit Guide</h1>
      {submitGuideError ? (
        <p className="text-red-500">{submitGuideError.message}</p>
      ) : null}
      <h2 className="mt-2 flex items-center text-xl font-bold">
        YouTube Link
        <Tooltip content="test" />
      </h2>
      <div className="mt-3 flex w-full">
        <Input
          type="text"
          placeholder="Link to Guide on YouTube"
          ref={videoUrlInputRef}
          errorMessage={
            youtubeError?.data?.zodError?.formErrors[0] ?? youtubeError?.message
          }
          className="mr-4 w-[50vw]"
        />
        <Button
          onClick={getVideoDetails}
          type="button"
          isLoading={videoIsLoading}
          className="h-full"
        >
          <HiArrowsUpDown className="inline-block md:mr-2" />
          <span className="hidden md:inline-block">Fetch</span>
        </Button>
      </div>
      {/* Loading state for fetching video */}
      {youtubeData ? (
        <div className="mt-4 flex flex-col md:flex-row">
          <div className="relative h-44 w-80 min-w-[320px] max-w-full overflow-hidden rounded-md drop-shadow-md md:rounded-lg">
            <Image
              src={youtubeData.thumbnail}
              alt={youtubeData.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="mt-2 gap-2 md:ml-4 md:mt-0">
            <h3 className="text-lg font-bold md:text-2xl">
              {youtubeData.title}
            </h3>
            <p className="mt-2 text-slate-300">{youtubeData.channelTitle}</p>
          </div>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="mt-2 md:mt-5">
        <h2 className="text-xl font-bold">
          Select Operators &#40;Click to Remove&#41;
        </h2>
        {selectedOperators.length > 0 ? (
          <div className="my-2 flex flex-wrap gap-4">
            {selectedOperators
              .sort((a, b) => b.rarity - a.rarity)
              .map((operator) => {
                return (
                  <div
                    key={operator.id}
                    className={`${translateRarityToClassName(
                      operator.rarity
                    )} relative h-16 w-16 cursor-pointer overflow-hidden rounded-md`}
                    onClick={() => {
                      setSelectedOperators(
                        selectedOperators.filter(
                          (selectedOperator) =>
                            selectedOperator.id !== operator.id
                        )
                      );
                    }}
                  >
                    <Image
                      src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                      alt={operator.name}
                      width={64}
                      height={64}
                    />
                    <div className="absolute h-full w-full bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100">
                      <p className="absolute bottom-0 w-full truncate px-1 text-center text-sm">
                        {operator.name}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : null}
        <SelectOperatorDropdown
          operators={operatorList.filter(
            (operator) => !selectedOperators.includes(operator)
          )}
          setSelectedOperators={setSelectedOperators}
          className="mt-2"
        />
        <h2 className="mt-5 text-xl font-bold">
          Select Tags &#40;Click to Remove&#41;
        </h2>
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 py-2 md:gap-3">
            {selectedTags.map((tag) => {
              return (
                <TagCard
                  tag={tag}
                  key={tag.id}
                  onClick={() => {
                    setSelectedTags(
                      selectedTags.filter(
                        (selectedTag) => selectedTag.id !== tag.id
                      )
                    );
                  }}
                />
              );
            })}
          </div>
        ) : null}
        <SelectTagDropdown
          setSelectedTags={setSelectedTags}
          tags={tagList.filter((tag) => !selectedTags.includes(tag))}
          className="mt-2"
        />
        <h2 className="mt-5 text-xl font-bold">Select a Stage</h2>
        <motion.div
          key={selectedStage?.id ?? "none"}
          className="my-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              ease: "easeOut",
              duration: 0.3,
            },
          }}
        >
          {selectedStage?.stageCode && (
            <>
              <b>{selectedStage.stageCode}</b> -{" "}
            </>
          )}
          {selectedStage?.stageName ?? "Please select a stage"}
        </motion.div>
        <SelectStageMenu
          eventList={eventList}
          setSelectedStage={setSelectedStage}
          selectedStage={selectedStage}
        />
        <Button className="my-5" type="submit" isLoading={isSubmitting}>
          Submit
        </Button>
      </form>
    </>
  );
};

export default SubmitGuide;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const operatorList = await prisma.operator.findMany({
    orderBy: [
      {
        rarity: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
  const tagList = await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const eventList = await getEvent();

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      operatorList,
      tagList,
      eventList: JSON.parse(JSON.stringify(eventList)),
    },
  };
};
