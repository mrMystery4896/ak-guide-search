import { Stage } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const stageRouter = router({
  getStageforEvent: publicProcedure
    .input(z.string().min(1).nullable())
    .query(({ ctx, input }) => {
      if (!input) return [];
      return ctx.prisma.stage.findMany({
        where: {
          eventId: input,
        },
      });
    }),
  addStage: protectedProcedure
    .input(
      z.object({
        stageCodes: z.array(z.string().min(1)),
        parentEventId: z.string().cuid({ message: "Invalid event." }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });

      // check if stageCode is unique
      let existingMatchingStage: Stage[];
      try {
        existingMatchingStage = await ctx.prisma.stage.findMany({
          where: {
            stageCode: {
              in: input.stageCodes,
            },
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      if (existingMatchingStage.length > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stage already exists.",
        });

      // create stage
      try {
        await ctx.prisma.stage.createMany({
          data: input.stageCodes.map((stageCode) => ({
            stageCode,
            eventId: input.parentEventId,
          })),
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
