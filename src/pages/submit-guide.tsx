import { GetServerSideProps, type NextPage } from "next";
import Image from "next/image";
import { useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { Event, Operator, Stage, Tag } from "@prisma/client";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { env } from "../env/client.mjs";

const SubmitGuide: NextPage = () => {
  const videoUrlInputRef = useRef<HTMLInputElement>(null);

  const [selectedOperators, setSelectedOperators] = useState<Operator[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [videoId, setVideoId] = useState<string>("");

  const operatorListData = trpc.operator.getAllOperators.useQuery();
  const tagListData = trpc.tag.getAllTags.useQuery();
  const eventListData = trpc.event.getAllEvents.useQuery();
  const stageListData = trpc.stage.getStageforEvent.useQuery(
    selectedEvent?.id ?? null
  );

  const {
    data: youtubeData,
    error: youtubeError,
    isLoading,
    mutate,
  } = trpc.youtube.getVideo.useMutation();
  const { error: submitGuideError, mutate: submitGuide } =
    trpc.guide.submitGuide.useMutation();

  const getVideoDetails = async () => {
    // set video id from youtube url entered in input
    if (!videoUrlInputRef.current) return;
    const url = new URL(videoUrlInputRef.current.value);
    const videoId = url.searchParams.get("v");
    if (!videoId) return;
    setVideoId(videoId);
    mutate(videoId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({});
    if (!selectedStage) return;
    if (!youtubeData) return;
    submitGuide({
      id: videoId,
      title: youtubeData.title,
      stageCode: selectedStage.stageCode,
      operatorIds: selectedOperators.map((operator) => operator.id),
      tags: selectedTags.map((tag) => tag.id),
      uploadedById: youtubeData.channelId,
      thumbnailUrl: youtubeData.thumbnail,
    });
  };

  // if (operatorListData.isLoading || tagListData.isLoading)
  //   return <p>Loading...</p>;

  return (
    <>
      <h1 className="text-2xl font-bold">Submit Guide</h1>
      {submitGuideError ? (
        <p className="text-red-500">{submitGuideError.message}</p>
      ) : null}
      <input
        type="text"
        placeholder="link to YouTube video"
        ref={videoUrlInputRef}
      />
      <button onClick={getVideoDetails} type="button">
        get details
      </button>
      {youtubeError ? (
        <p>{youtubeError.data?.zodError?.formErrors[0]}</p>
      ) : null}
      {/* Loading state for fetching video */}
      {isLoading ? <p>Loading...</p> : null}
      {youtubeData ? (
        <div>
          <b>{youtubeData.title}</b>
          <p>{youtubeData.channelTitle}</p>
          <Image
            src={youtubeData.thumbnail}
            alt={youtubeData.title}
            height={480}
            width={640}
          />
        </div>
      ) : (
        <p>No video</p>
      )}
      <form onSubmit={handleSubmit}>
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
        <select
          onChange={(e) => {
            setSelectedOperators([
              ...selectedOperators,
              operatorListData.data?.find(
                (operator) => operator.id === e.target.value
              ) as Operator,
            ]);
            e.target.value = "";
          }}
          defaultValue={""}
          className="w-64"
        >
          <option value="" disabled>
            Select Operator
          </option>
          {operatorListData.data ? (
            operatorListData.data
              .filter((operator) => !selectedOperators.includes(operator))
              .map((operator) => {
                return (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                );
              })
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
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
              tagListData.data?.find((tag) => tag.id === e.target.value) as Tag,
            ]);
            e.target.value = "";
          }}
          defaultValue={""}
          className="w-32"
        >
          <option value="" disabled>
            Select Tag
          </option>
          {tagListData.data ? (
            tagListData.data
              .filter((tag) => !selectedTags.includes(tag))
              .map((tag) => {
                return (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                );
              })
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
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
            const selectedEventObject = eventListData.data?.find(
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
          {eventListData.data ? (
            eventListData.data.map((event) => {
              return (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              );
            })
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
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

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
