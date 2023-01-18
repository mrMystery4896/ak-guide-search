import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import fetch from "node-fetch";
import { TRPCError } from "@trpc/server";

export const guideRouter = router({
  getRecentGuides: publicProcedure
    .input(z.number().min(1))
    .query(({ ctx, input }) => {
      // return ctx.prisma.guide.findMany({
      //   where: {
      //     status: "APPROVED",
      //   },
      //   orderBy: {
      //     submittedAt: "desc",
      //   },
      //   include: {
      //     operators: true,
      //     uploadedBy: true,
      //     tags: true,
      //   },
      //   take: input,
      // });
      return ctx.prisma.guideOperator.findMany({
        include: {
          guide: {
            include: {
              tags: true,
            },
          },
          operator: true,
        },
        where: {
          guide: {
            status: "APPROVED",
          },
        },
        orderBy: {
          guide: {
            submittedAt: "desc",
          },
        },
        take: input,
      });
    }),
  submitGuide: protectedProcedure
    .input(
      z.object({
        id: z.string().length(11),
        title: z.string(),
        stageId: z.string().min(1),
        operators: z.array(
          z.object({
            id: z.string().min(1),
            elite: z.number().min(0).max(2).nullable(),
            level: z.number().min(1).max(90).nullable(),
            skill: z.number().min(1).max(3).nullable(),
            skillLevel: z.number().min(1).max(7).nullable(),
            mastery: z.number().min(0).max(3).nullable(),
            moduleType: z
              .string()
              .regex(/X|Y|None/)
              .nullable(),
            moduleLevel: z.number().min(1).max(3).nullable(),
          })
        ),
        tags: z.array(z.string().cuid()),
        uploadedById: z.string().min(1),
        uploadedByName: z.string().min(1),
        thumbnailUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const guideThumbnailBucket = ctx.storage.bucket("guide-thumbnail");
      const file = guideThumbnailBucket.file(`${input.id}.png`);
      const stream = file.createWriteStream({ resumable: false });

      try {
        const res = await fetch(input.thumbnailUrl);
        res.body?.pipe(stream);
      } catch (e) {
        throw new TRPCError({
          message: "Failed to upload thumbnail",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      try {
        return await ctx.prisma.guide.create({
          data: {
            id: input.id,
            title: input.title,
            stage: {
              connect: {
                id: input.stageId,
              },
            },
            guideOperator: {
              create: input.operators.map((operator) => {
                return {
                  operator: {
                    connect: {
                      id: operator.id,
                    },
                  },
                  elite: operator.elite,
                  level: operator.level,
                  skill: operator.skill,
                  skillLevel: operator.skillLevel,
                  mastery: operator.mastery,
                  moduleType: operator.moduleType as "X" | "Y" | "None" | null,
                  moduleLevel: operator.moduleLevel,
                };
              }),
            },
            tags: {
              connect: input.tags.map((id) => ({ id })),
            },
            status: ctx.session.user.role === "USER" ? "PENDING" : "APPROVED",
            submittedAt: new Date(),
            submittedBy: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            uploadedBy: {
              connectOrCreate: {
                create: {
                  id: input.uploadedById,
                  name: input.uploadedByName,
                },
                where: {
                  id: input.uploadedById,
                },
              },
            },
          },
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later",
        });
      }
    }),
});
