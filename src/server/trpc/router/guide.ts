import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

export const guideRouter = router({
    test: publicProcedure
        .input(z.string())
        .query(({input}) => {
            return 'hello' + input;
        }),
    testPrisma: publicProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            return ctx.prisma.creator.findFirst({
                where: {
                    name: input
                },
            })
        }),
    getRecentGuides: publicProcedure
        .input(z.number().min(1))
        .query(({ ctx, input }) => {
            return ctx.prisma.guide.findMany({
                orderBy: {
                    submittedAt: 'desc'
                },
                include: {
                    operators: true,
                },
                take: input
            })
        })
});