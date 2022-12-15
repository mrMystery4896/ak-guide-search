import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const guideRouter = router({
    getRecentGuides: publicProcedure
        .input(z.number().min(1))
        .query(({ ctx, input }) => {
            return ctx.prisma.guide.findMany({
                where: {
                    status: "APPROVED"
                },
                orderBy: {
                    submittedAt: 'desc'
                },
                include: {
                    operators: true,
                    uploadedBy: true,
                    tags: true
                },
                take: input
            })
        }),
    submitGuide: protectedProcedure
        .input(z.object({
            id: z.string().length(11).regex(/^[a-zA-Z0-9]+$/),
            title: z.string(),
            stageCode: z.string().min(1),
            operatorIds: z.array(z.string().min(1)),
            tags: z.array(z.string().cuid()),
            uploadedById: z.string().startsWith('@')
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.guide.create({
                data: {
                    id: input.id,
                    title: input.title,
                    stage: {
                        connect: {
                            stageCode: input.stageCode
                        }
                    },
                    operators: {
                        connect: input.operatorIds.map(id => ({ id }))
                    },
                    tags: {
                        connect: input.tags.map(id => ({ id }))
                    },
                    status: "PENDING",
                    submittedAt: new Date(),
                    submittedBy: {
                        connect: {
                            id: ctx.session.user.id
                        },
                    },
                    uploadedBy: {
                        connect: {
                            id: input.uploadedById
                        }
                    }
                }
            })
        })
});