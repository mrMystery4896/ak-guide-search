import { type NextPage } from "next";
import Image from "next/image";
import { useRef } from "react";
import { trpc } from "../utils/trpc";

const SubmitGuide: NextPage = () => {
  const data = trpc.operator.getAllOperators.useQuery();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    data: youtubeData,
    error: youtubeError,
    isLoading,
    mutate,
  } = trpc.youtube.getVideo.useMutation();

  const getVideoDetails = async () => {
    // set video id from youtube url entered in input
    if (!inputRef.current) return;
    const url = new URL(inputRef.current.value);
    const videoId = url.searchParams.get("v");
    if (!videoId) return;
    mutate(videoId);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Submit Guide</h1>
      <select>
        {data.status === "success" ? (
          data.data.map((operator) => {
            return (
              <option key={operator.id} value={operator.id}>
                {operator.name}
              </option>
            );
          })
        ) : (
          <>
            {data.isLoading ? (
              <option disabled>Loading...</option>
            ) : (
              <option disabled>Error</option>
            )}
          </>
        )}
      </select>
      <input type="text" placeholder="link to YouTube video" ref={inputRef} />
      <button onClick={getVideoDetails}>get details</button>
      {youtubeError ? (
        <p>{youtubeError.data?.zodError?.formErrors[0]}</p>
      ) : null}
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
    </>
  );
};

export default SubmitGuide;
