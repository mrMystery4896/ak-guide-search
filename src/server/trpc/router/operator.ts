import { router, publicProcedure } from "../trpc";

export const operatorRouter = router({
  getAllOperators: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.operator.findMany({
      orderBy: [
        {
          rarity: "desc",
        },
        {
          name: "asc",
        },
      ],
    });
  }),
});
