import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
      if (input.startDate && input.endDate && input.startDate > input.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date.",
        });
      }
      try {
        return await ctx.prisma.event.create({
          data: {
            name: input.name,
            description: input.description,
            startDate: input.startDate,
            endDate: input.endDate,
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
});
