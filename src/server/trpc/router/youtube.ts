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
        .length(11, { message: "Invalid YouTube video ID" })
        .regex(/[a-zA-Z0-9_-]{11}$/, {
          message: "Invalid YouTube video ID",
        })
    )
    .mutation(async ({ ctx, input }) => {
      return fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${input}&key=${env.GOOGLE_API_KEY}`
      )
        .then((res) => {
          return res.json() as Promise<YoutubeVideo>;
        })
        .then((res) => {
          if (res.items.length > 0) {
            const snippet = res.items[0]?.snippet;
            if (snippet) {
              return {
                id: input,
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
