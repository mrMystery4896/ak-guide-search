import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { type YoutubeVideo } from "youtube-video";
import { TRPCError } from "@trpc/server";
import { env } from "../../../env/server.mjs";

export const youtubeRouter = router({
  getVideo: protectedProcedure
    .input(
      z
        .string()
        .min(1, { message: "Please enter a link." })
        .url({ message: "Invalid URL." })
        .startsWith("https://www.youtube.com/watch?v=", {
          message: "Invalid URL. Please enter a link from YouTube.",
        })
    )
    .mutation(async ({ input }) => {
      const urlObj: URL = new URL(input);
      const videoId = urlObj.searchParams.get("v");
      if (!videoId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid URL.",
        });
      }
      return fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${env.GOOGLE_API_KEY}`
      )
        .then((res) => {
          return res.json() as Promise<YoutubeVideo>;
        })
        .then((res) => {
          if (res.items.length > 0) {
            const snippet = res.items[0]?.snippet;
            if (snippet) {
              return {
                id: videoId,
                channelId: snippet.channelId,
                title: snippet.title,
                thumbnail: Object.values(snippet.thumbnails).pop()?.url,
                channelTitle: snippet.channelTitle,
              };
            } else {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Video not found",
              });
            }
          } else {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Video not found",
            });
          }
        });
    }),
});
