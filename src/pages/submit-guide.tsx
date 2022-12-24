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
import LoadingSpinner from "../components/LoadingSpinner";
import { prisma } from "../server/db/client";

interface SubmitGuideProps {
  operatorList: Operator[];
  tagList: Tag[];
  eventList: Event[];
}

const SubmitGuide: NextPage<SubmitGuideProps> = ({
  operatorList,
  tagList,
  eventList,
}) => {
  const videoUrlInputRef = useRef<HTMLInputElement>(null);

  const [selectedOperators, setSelectedOperators] = useState<Operator[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const stageListData = trpc.stage.getStageforEvent.useQuery(
    selectedEvent?.id ?? null
  );

  const {
    data: youtubeData,
    error: youtubeError,
    isLoading: videoIsLoading,
    mutate,
  } = trpc.youtube.getVideo.useMutation();
  const { error: submitGuideError, mutate: submitGuide } =
    trpc.guide.submitGuide.useMutation();

  const getVideoDetails = async () => {
    if (!videoUrlInputRef.current) return;
    mutate(videoUrlInputRef.current.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage) return;
    if (!youtubeData) return;
    submitGuide({
      id: youtubeData.id,
      title: youtubeData.title,
      stageCode: selectedStage.stageCode,
      operatorIds: selectedOperators.map((operator) => operator.id),
      tags: selectedTags.map((tag) => tag.id),
      uploadedById: youtubeData.channelId,
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
          errorMessage={youtubeError?.data?.zodError?.formErrors[0]}
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
          <div className="relative h-44 w-80 overflow-hidden rounded-md">
            <Image
              src={youtubeData.thumbnail}
              alt={youtubeData.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="mt-2 gap-2 md:ml-4 md:mt-0">
            <h3 className="text-lg font-bold">{youtubeData.title}</h3>
            <p className="text-slate-300">{youtubeData.channelTitle}</p>
          </div>
        </div>
      ) : (
        <p>No video</p>
      )}
      <form onSubmit={handleSubmit} className="mt-2">
        <h2 className="text-xl font-bold">Select Operators</h2>
        {selectedOperators.map((operator) => {
          return (
            <div key={operator.id}>
              <p>{operator.name}</p>
              <button
                onClick={() => {
                  setSelectedOperators(
                    selectedOperators.filter(
                      (selectedOperator) => selectedOperator.id !== operator.id
                    )
                  );
                }}
              >
                remove
              </button>
            </div>
          );
        })}
        <SelectOperatorDropdown
          operators={operatorList.filter(
            (operator) => !selectedOperators.includes(operator)
          )}
          setSelectedOperators={setSelectedOperators}
        />
        <br />
        {selectedTags.map((tag) => {
          return (
            <div key={tag.id}>
              <p>{tag.name}</p>
              <button
                onClick={() => {
                  setSelectedTags(
                    selectedTags.filter(
                      (selectedTag) => selectedTag.id !== tag.id
                    )
                  );
                }}
              >
                remove
              </button>
            </div>
          );
        })}
        <select
          onChange={(e) => {
            setSelectedTags([
              ...selectedTags,
              tagList.find((tag) => tag.id === e.target.value) as Tag,
            ]);
            e.target.value = "";
          }}
          defaultValue={""}
          className="w-32"
        >
          <option value="" disabled>
            Select Tag
          </option>
          {tagList
            .filter((tag) => !selectedTags.includes(tag))
            .map((tag) => {
              return (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              );
            })}
        </select>
        <br />
        {selectedEvent ? (
          <Image
            src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/ak-event-banner/${selectedEvent.id}.png`}
            alt={selectedEvent.name}
            width={640}
            height={480}
          />
        ) : null}
        <select
          // value={selectedEvent?.id ?? ""}
          onChange={(e) => {
            const selectedEventObject = eventList.find(
              (event) => event.id === e.target.value
            );
            setSelectedEvent(selectedEventObject ?? null);
          }}
          defaultValue={""}
          className="w-64"
        >
          <option value="" disabled>
            Select Event
          </option>
          {eventList.map((event) => {
            return (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            );
          })}
        </select>
        <br />
        <select
          defaultValue={selectedEvent ? "" : "no-event-selected"}
          disabled={!selectedEvent}
          // value={selectedStage?.stageCode ?? ""}
          onChange={(e) => {
            const selectedStageObject = stageListData.data?.find(
              (stage) => stage.stageCode === e.target.value
            );
            setSelectedStage(selectedStageObject ?? null);
          }}
        >
          {selectedEvent ? (
            <option value="" disabled>
              Select a stage
            </option>
          ) : (
            <option value="no-event-selected" disabled>
              Please select an event first
            </option>
          )}
          {stageListData.data ? (
            stageListData.data.map((stage) => {
              return (
                <option key={stage.stageCode} value={stage.stageCode}>
                  {stage.stageCode}
                </option>
              );
            })
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
        <button type="submit">Submit</button>
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
  const eventList = await prisma.event.findMany({
    orderBy: {
      startDate: "desc",
    },
  });

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
