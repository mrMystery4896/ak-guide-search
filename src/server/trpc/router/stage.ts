import { z } from "zod";
import { router, publicProcedure } from "../trpc";

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
});
