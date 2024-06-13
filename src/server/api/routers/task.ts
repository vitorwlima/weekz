import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(2),
        date: z.string(),
        estimatedTime: z.number().optional(),
        frequency: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          userId: ctx.userId,
          title: input.title,
          date: input.date,
          estimatedTime: input.estimatedTime,
          frequency: input.frequency,
        },
      })
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany({
      where: {
        userId: ctx.userId,
      },
    })
  }),
})
