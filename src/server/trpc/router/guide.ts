import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import fetch from "node-fetch";
import { TRPCError } from "@trpc/server";

export const guideRouter = router({
  getRecentGuides: publicProcedure
    .input(z.number().min(1))
    .query(({ ctx, input }) => {
      return ctx.prisma.guide.findMany({
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
        take: input,
      });
    }),
  submitGuide: protectedProcedure
    .input(
      z.object({
        id: z.string().length(11),
        title: z.string(),
        stageCode: z.string().min(1),
        operatorIds: z.array(z.string().min(1)),
        tags: z.array(z.string().cuid()),
        uploadedById: z.string(),
        thumbnailUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const guideThumbnailBucket = ctx.storage.bucket("guide-thumbnail");
      const file = guideThumbnailBucket.file(`${input.id}.png`);
      const stream = file.createWriteStream({ resumable: false });

      // TODO: Handle errors (with try/catch)
      await fetch(input.thumbnailUrl).then((res) => {
        res.body?.pipe(stream);
      });

      return ctx.prisma.guide.create({
        data: {
          id: input.id,
          title: input.title,
          stage: {
            connect: {
              stageCode: input.stageCode,
            },
          },
          operators: {
            connect: input.operatorIds.map((id) => ({ id })),
          },
          tags: {
            connect: input.tags.map((id) => ({ id })),
          },
          status: "PENDING",
          submittedAt: new Date(),
          submittedBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          uploadedBy: {
            connect: {
              id: input.uploadedById,
            },
          },
        },
      });
    }),
});
