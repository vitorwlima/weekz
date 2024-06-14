'use client'

import clsx from 'clsx'
import { LucidePlusCircle as LucidePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { useHandleOutsideClick } from '~/lib/use-handle-outside-click'
import { useZodForm } from '~/lib/use-zod-form'
import { api } from '~/trpc/react'

type Props =
  | {
      isBrainDumpTask: false;
      date: string;
    }
  | {
      isBrainDumpTask: true;
      date?: never;
    };

const addTaskSchema = z.object({
  title: z.string().min(2),
  estimatedTime: z.string().optional(),
})

export const AddTaskInput: React.FC<Props> = ({ isBrainDumpTask, date }) => {
  const utils = api.useUtils()
  const { mutate } = api.task.create.useMutation({
    onSuccess: async () => {
      reset()
      await utils.task.getAll.invalidate()
    },
  })

  const { register, handleSubmit, reset } = useZodForm({
    schema: addTaskSchema,
    onSubmit: (data) => {
      const estimatedTime = data.estimatedTime
        ? data.estimatedTime
            .split(':')
            .reduce((acc, cur) => acc * 60 + Number(cur), 0)
        : undefined

      mutate({
        title: data.title,
        date: isBrainDumpTask ? 'braindump' : date,
        frequency: 'once',
        estimatedTime,
      })
    },
  })

  const containerRef = useRef<HTMLFormElement>(null)
  const [shouldShowTime, setShouldShowTime] = useState(false)

  useHandleOutsideClick({
    ref: containerRef,
    onOutsideClick: () => setShouldShowTime(false),
  })

  return (
    <form
      onSubmit={handleSubmit}
      // onBlur={() => reset()} // onBlur reset both inputs
      ref={containerRef}
      className="relative text-sm"
    >
      <LucidePlus
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400"
      />

      <input
        {...register('title')}
        type="text"
        placeholder="Add a task"
        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-3 py-2 pl-10 outline-none placeholder:font-light placeholder:text-neutral-500"
        onFocus={() => setShouldShowTime(true)}
      />

      <input
        {...register('estimatedTime')} // TODO: on enter here submit
        type="time"
        className={clsx(
          'absolute right-1.5 top-0 w-fit translate-y-[5px] rounded-lg border border-neutral-300 bg-neutral-50 p-1 text-xs outline-none placeholder:font-light placeholder:text-neutral-500',
          shouldShowTime ? 'block' : 'hidden',
        )}
      />
    </form>
  )
}
