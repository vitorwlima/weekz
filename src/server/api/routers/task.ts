import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany({
      where: {
        userId: ctx.userId,
      },
    })
  }),
  getCompletions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.taskCompletion.findMany({
      where: {
        userId: ctx.userId,
      },
    })
  }),
  completeTask: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        date: z.string(),
        completed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const completion = await ctx.db.taskCompletion.findFirst({
        where: {
          userId: ctx.userId,
          taskOrSubtaskId: input.id,
          date: input.date,
        },
      })

      if (completion) {
        return ctx.db.taskCompletion.update({
          where: {
            id: completion.id,
          },
          data: {
            completed: input.completed,
          },
        })
      }

      return ctx.db.taskCompletion.create({
        data: {
          userId: ctx.userId,
          taskOrSubtaskId: input.id,
          date: input.date,
          completed: input.completed,
        },
      })
    }),
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(2),
        date: z.string(),
        estimatedTime: z.number().optional().nullable(),
        frequency: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        data: {
          title: input.title,
          date: input.date,
          estimatedTime: input.estimatedTime,
          frequency: input.frequency,
        },
      })
    }),
})
