import { Stage, Event } from "@prisma/client";
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
        stages: z.array(
          z.object({
            stageCode: z
              .string()
              .min(1, {
                message: "Stage code must include at least 1 character",
              })
              .nullable(),
            stageName: z.string().min(1, {
              message: "Stage name must include at least 1 character",
            }),
          })
        ),
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
      let existingMatchingStage: Stage | null;
      try {
        existingMatchingStage = await ctx.prisma.stage.findFirst({
          where: {
            stageCode: {
              in: input.stages
                .map((stageCode) => stageCode.stageCode)
                .filter(
                  (stageCode) =>
                    stageCode !== null &&
                    stageCode !== undefined &&
                    stageCode !== ""
                ) as string[],
            },
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      if (existingMatchingStage !== null)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stage already exists.",
        });

      // create stage
      try {
        await ctx.prisma.stage.createMany({
          data: input.stages.map((stage) => ({
            stageCode: stage.stageCode || null,
            stageName: stage.stageName,
            eventId: input.parentEventId,
          })),
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later.",
        });
      }
    }),
  editStage: protectedProcedure
    .input(
      z.object({
        stageId: z.string().cuid({ message: "Invalid stage." }),
        stageName: z.string().min(1, { message: "Stage name is required." }),
        stageCode: z
          .string()
          .min(1, { message: "Stage name must be at least 1 character." })
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });

      if (input.stageCode) {
        let existingStage: Stage | null;
        try {
          existingStage = await ctx.prisma.stage.findFirst({
            where: {
              stageCode: input.stageCode,
            },
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
          });
        }

        if (existingStage !== null) {
          if (existingStage.id !== input.stageId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Stage code already exists.",
            });
          }
        }
      }

      if (!input.stageName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stage name is required.",
        });
      }

      try {
        await ctx.prisma.stage.update({
          where: {
            id: input.stageId,
          },
          data: {
            stageName: input.stageName,
            stageCode: input.stageCode,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later.",
        });
      }
    }),
  moveStage: protectedProcedure
    .input(
      z.object({
        stageId: z.string().cuid({ message: "Invalid stage." }),
        parentEventId: z
          .string()
          .cuid({ message: "Invalid stage." })
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      // check if parent stage exists and does not have child events
      if (input.parentEventId !== null) {
        let parentEvent: Event[];
        try {
          parentEvent = await ctx.prisma.event.findMany({
            where: {
              OR: [
                {
                  id: input.parentEventId,
                },
                {
                  parentEventId: input.parentEventId,
                },
              ],
            },
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
          });
        }
        // check if parentEvent array has an element with the same id, if no, means destination event does not exist
        if (
          parentEvent.find((event) => event.id === input.parentEventId) ===
          undefined
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Destination category does not exist.",
          });
        }
        // check if parentEvent array has element with the same parentEventId, if yes, means destination event already has child event
        if (
          parentEvent.find(
            (event) => event.parentEventId === input.parentEventId
          ) !== undefined
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Destination category already has child category.",
          });
        }
        // Move the event
        try {
          await ctx.prisma.stage.update({
            where: {
              id: input.stageId,
            },
            data: {
              eventId: input.parentEventId,
            },
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
          });
        }
      }
    }),
  deleteStage: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      // check if stage exists
      let stage: Stage | null;
      try {
        stage = await ctx.prisma.stage.findFirst({
          where: {
            id: input,
          },
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later.",
        });
      }
      if (stage === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stage does not exist.",
        });
      }
      try {
        await ctx.prisma.stage.delete({
          where: {
            id: input,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later.",
        });
      }
    }),
});
