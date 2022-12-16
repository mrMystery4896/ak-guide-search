import { router, publicProcedure } from "../trpc";

export const eventRouter = router({
  getAllEvents: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
  }),
});
