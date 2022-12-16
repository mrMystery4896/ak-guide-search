import { router, publicProcedure } from "../trpc";

export const tagRouter = router({
  getAllTags: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.tag.findMany({
      orderBy: [
        {
          name: "asc",
        },
      ],
    });
  }),
});
