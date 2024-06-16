import { Frequency, type TaskRepetition } from '@prisma/client'
import { format, getDate, getDay, isAfter, parse } from 'date-fns'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        dates: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.task.findMany({
        where: {
          userId: ctx.userId,
          OR: [
            {
              date: {
                in: input.dates,
              },
            },
            {
              isBrainDump: true,
            },
          ],
        },
        include: {
          taskRepetition: {
            select: {
              id: true,
              frequency: true,
            },
          },
        },
      })
    }),
  completeTask: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        completed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        data: {
          completed: input.completed,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(2),
        date: z.string(),
        estimatedTime: z.number().optional(),
        notes: z.string(),
        isBrainDump: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const taskCount = await ctx.db.task.count({
        where: {
          userId: ctx.userId,
          date: input.date,
        },
      })

      return ctx.db.task.create({
        data: {
          userId: ctx.userId,
          title: input.title,
          date: input.date,
          estimatedTime: input.estimatedTime,
          notes: input.notes,
          isBrainDump: input.isBrainDump,
          completed: false,
          order: taskCount + 1,
        },
      })
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })
    }),
  updateDate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        date: z.string(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order =
        typeof input.order === 'number'
          ? input.order
          : (await ctx.db.task.count({
              where: {
                userId: ctx.userId,
                date: input.date,
              },
            })) + 1

      return ctx.db.task.update({
        data: {
          date: input.date,
          isBrainDump: false,
          order,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })
    }),
  updateFrequency: protectedProcedure
    .input(
      z.object({
        taskRepetitionId: z.string().uuid().optional(),
        taskId: z.string().uuid(),
        frequency: z.nativeEnum(Frequency).optional(),
        startDate: z.string(),
        title: z.string(),
        weekDay: z.number().optional(),
        monthDay: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.taskRepetitionId && input.frequency !== undefined) {
        return ctx.db.taskRepetition.create({
          data: {
            frequency: input.frequency,
            startDate: input.startDate,
            title: input.title,
            userId: ctx.userId,
            weekDay: input.weekDay,
            monthDay: input.monthDay,
            tasks: {
              connect: {
                id: input.taskId,
              },
            },
          },
        })
      }

      if (!input.frequency) {
        return ctx.db.taskRepetition.delete({
          where: {
            id: input.taskRepetitionId,
          },
        })
      }

      return ctx.db.taskRepetition.update({
        data: {
          frequency: input.frequency,
          weekDay: input.weekDay,
          monthDay: input.monthDay,
          tasks: {
            connect: {
              id: input.taskId,
            },
          },
        },
        where: {
          id: input.taskRepetitionId,
        },
      })
    }),
  createRepeatingTasks: protectedProcedure
    .input(z.object({ dates: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const taskRepetitions = await ctx.db.taskRepetition.findMany({
        where: {
          userId: ctx.userId,
        },
      })

      const dates = input.dates.map((date) =>
        parse(date, 'dd/MM/yyyy', new Date()),
      )

      const createManyTasks = async ({
        taskRepetition,
        dates,
      }: {
        taskRepetition: TaskRepetition;
        dates: Date[];
      }) => {
        const conflictingTasks = await ctx.db.task.findMany({
          where: {
            userId: ctx.userId,
            date: {
              in: dates.map((date) => format(date, 'dd/MM/yyyy')),
            },
            taskRepetitionId: taskRepetition.id,
          },
          select: {
            date: true,
          },
        })

        const unconflictingDates = dates.filter(
          (date) =>
            isAfter(
              date,
              parse(taskRepetition.startDate, 'dd/MM/yyyy', new Date()),
            ) &&
            !conflictingTasks.some(
              (task) => task.date === format(date, 'dd/MM/yyyy'),
            ),
        )

        await ctx.db.task.createMany({
          data: unconflictingDates.map((date) => ({
            userId: ctx.userId,
            title: taskRepetition.title,
            date: format(date, 'dd/MM/yyyy'),
            estimatedTime: null,
            notes: '',
            isBrainDump: false,
            completed: false,
            order: 0,
            taskRepetitionId: taskRepetition.id,
          })),
        })
      }

      for (const taskRepetition of taskRepetitions) {
        if (taskRepetition.frequency === Frequency.DAILY) {
          await createManyTasks({ taskRepetition, dates })
        }

        if (taskRepetition.frequency === Frequency.WEEKLY) {
          await createManyTasks({
            taskRepetition,
            dates: dates.filter(
              (date) => getDay(date) === taskRepetition.weekDay,
            ),
          })
        }

        if (taskRepetition.frequency === Frequency.MONTHLY) {
          await createManyTasks({
            taskRepetition,
            dates: dates.filter(
              (date) => getDate(date) === taskRepetition.monthDay,
            ),
          })
        }

        if (taskRepetition.frequency === Frequency.YEARLY) {
          await createManyTasks({
            taskRepetition,
            dates: dates.filter(
              (date) =>
                getDate(date) === taskRepetition.monthDay &&
                getDay(date) === taskRepetition.weekDay,
            ),
          })
        }

        if (taskRepetition.frequency === Frequency.WEEKDAYS) {
          await createManyTasks({
            taskRepetition,
            dates: dates.filter((date) => getDay(date) > 0 && getDay(date) < 6),
          })
        }

        if (taskRepetition.frequency === Frequency.WEEKENDS) {
          await createManyTasks({
            taskRepetition,
            dates: dates.filter(
              (date) => getDay(date) === 0 || getDay(date) === 6,
            ),
          })
        }
      }
    }),
  updateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        data: {
          title: input.title,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })
    }),
  updateEstimatedTime: protectedProcedure
    .input(
      z.object({ id: z.string().uuid(), estimatedTime: z.number().nullable() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        data: {
          estimatedTime: input.estimatedTime,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })
    }),
  updateNotes: protectedProcedure
    .input(z.object({ id: z.string().uuid(), notes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        data: {
          notes: input.notes,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })
    }),
  dragToTask: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        date: z.string(),
        isBrainDump: z.boolean(),
        orderUpdates: z.array(
          z.object({ id: z.string().uuid(), order: z.number() }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction([
        ctx.db.task.update({
          data: {
            date: input.date,
            isBrainDump: input.isBrainDump,
          },
          where: {
            id: input.id,
          },
        }),
        ...input.orderUpdates.map(({ id, order }) =>
          ctx.db.task.update({
            data: {
              order,
            },
            where: {
              id,
            },
          }),
        ),
      ])
    }),
})
