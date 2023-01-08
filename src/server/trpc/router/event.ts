import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { convertDateToUTCMinus7 } from "../../../utils/functions";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const eventRouter = router({
  getAllEvents: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
  }),
  addEvent: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: "Please enter a name." }),
        description: z
          .string()
          .min(1, { message: "Please enter a description." })
          .nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        parentEventId: z.string().cuid().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      }
      if (!input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required.",
        });
      }
      if (input.startDate && input.endDate && input.startDate > input.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date.",
        });
      }
      // An event can only have either child events or stages, not both.
      if (input.parentEventId) {
        const parentEvent = await ctx.prisma.event.findUnique({
          where: { id: input.parentEventId },
          include: {
            stages: true,
            childEvents: true,
          },
        });
        if (!parentEvent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent category does not exist.",
          });
        }
        if (parentEvent.stages.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent event already has stages.",
          });
        }
      }

      try {
        return await ctx.prisma.event.create({
          data: {
            name: input.name,
            description: input.description,
            startDate: convertDateToUTCMinus7(input.startDate),
            endDate: convertDateToUTCMinus7(input.endDate),
            parentEvent: input.parentEventId
              ? { connect: { id: input.parentEventId } }
              : undefined,
          },
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the event.",
        });
      }
    }),
  editEvent: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1, { message: "Please enter a category name." }),
        description: z.string().nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      }
      if (!input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required.",
        });
      }
      if (input.startDate && input.endDate && input.startDate > input.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date.",
        });
      }
      try {
        await ctx.prisma.event.update({
          where: { id: input.id },
          data: {
            name: input.name,
            description: input.description,
            startDate: convertDateToUTCMinus7(input.startDate),
            endDate: convertDateToUTCMinus7(input.endDate),
          },
        });
        return "Category updated successfully.";
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while updating the category.",
        });
      }
    }),
});
