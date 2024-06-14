'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import {
  LucideCalendar,
  LucideCheck,
  LucideClock,
  LucideRepeat,
} from 'lucide-react'
import { api, type RouterOutputs } from '~/trpc/react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import * as Popover from '@radix-ui/react-popover'
import { format, parse } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useAutosizeTextArea } from '~/lib/use-autosize-textarea'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@uidotdev/usehooks'

type Props = {
  task: RouterOutputs['task']['getAll'][number] & { completed?: boolean };
};

const getFormattedTime = (time: number | null) => {
  if (time === null) return '--:--'

  const hours = Math.floor(time / 60)
  const minutes = time % 60

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
}

export const Task: React.FC<Props> = ({ task }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedTaskId = searchParams.get('task')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(
    getFormattedTime(task.estimatedTime),
  )
  const utils = api.useUtils()
  const { mutate: completeTaskMutate } = api.task.completeTask.useMutation({
    onSuccess: async () => {
      await utils.task.getCompletions.invalidate()
    },
  })
  const { mutate: updateTaskMutate } = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const debouncedEstimatedTime = useDebounce(estimatedTime, 400)
  const debouncedTitle = useDebounce(title, 400)

  useAutosizeTextArea(textareaRef.current, notes)

  const date =
    task.date === 'braindump'
      ? undefined
      : parse(task.date, 'dd/MM/yyyy', new Date())

  const handleOnCheckedChange = (value: Checkbox.CheckedState) => {
    completeTaskMutate({
      id: task.id,
      date: task.date,
      completed: value as boolean,
    })
  }

  const handleDateChange = (date?: Date) => {
    if (date === undefined) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      frequency: task.frequency,
      estimatedTime: task.estimatedTime ?? undefined,
      date: format(date, 'dd/MM/yyyy'),
    })
  }

  const onDialogOpenChange = (value: boolean) => {
    if (value) return router.push(`/planner?task=${task.id}`)
    return router.push('/planner')
  }

  useEffect(() => {
    const estimatedTime = debouncedEstimatedTime
      ? debouncedEstimatedTime
          .split(':')
          .reduce((acc, cur) => acc * 60 + Number(cur), 0)
      : null

    if (estimatedTime === task.estimatedTime || Number.isNaN(estimatedTime))
      return

    updateTaskMutate(
      {
        id: task.id,
        title: task.title,
        frequency: task.frequency,
        estimatedTime,
        date: task.date,
      },
      {
        onSuccess: (data) => {
          setEstimatedTime(getFormattedTime(data.estimatedTime))
        },
      },
    )
  }, [debouncedEstimatedTime, task, updateTaskMutate])
 
  useEffect(() => {
    if (debouncedTitle === task.title) return

    updateTaskMutate(
      {
        id: task.id,
        title: debouncedTitle,
        frequency: task.frequency,
        estimatedTime: task.estimatedTime,
        date: task.date,
      }
    )
  }, [debouncedTitle, task, updateTaskMutate])

  return (
    <Dialog.Root
      key={task.id}
      open={selectedTaskId === task.id}
      onOpenChange={onDialogOpenChange}
    >
      <Dialog.Trigger asChild>
        <li
          className="cursor-pointer rounded-xl border border-neutral-300 bg-neutral-50 p-4"
          onClick={() => router.push(`/planner?task=${task.id}`)}
        >
          <header className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              {task.date !== 'braindump' && (
                <div className="flex h-6 items-center justify-center">
                  <Checkbox.Root
                    className={clsx(
                      'flex aspect-square size-5 min-w-5 items-center justify-center rounded-lg border',
                      task.completed
                        ? 'border-green-500 bg-green-500'
                        : 'border-neutral-300',
                    )}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={handleOnCheckedChange}
                    checked={task.completed}
                  >
                    <Checkbox.Indicator>
                      <LucideCheck className="size-3 text-neutral-50" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              )}
              <p className="font-light">{task.title}</p>
            </div>
            <p className="min-w-fit rounded-md bg-neutral-200/50 p-1 text-xs font-light tracking-tighter text-neutral-500">
              {getFormattedTime(task.estimatedTime)}
            </p>
          </header>
        </li>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/60" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-100 p-6 outline-none">
          <Dialog.Title asChild>
            <input
              className="mb-4 bg-transparent text-2xl font-medium outline-none w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Dialog.Title>

          <form className="flex flex-col gap-2">
            <div className="grid grid-cols-3">
              <label className="col-span-1 flex items-center gap-1 text-sm text-neutral-500">
                <LucideCalendar className="size-4" />
                <p>Task date</p>
              </label>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="w-fit rounded-xl bg-neutral-300/80 px-2 py-0.5 hover:bg-neutral-300/50">
                    {date === undefined
                      ? 'Date not defined'
                      : format(date, 'MMMM do, yyyy')}
                  </button>
                </Popover.Trigger>
                <Popover.Content align="start">
                  <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="rounded-lg bg-neutral-50 p-2"
                  />
                </Popover.Content>
              </Popover.Root>
            </div>

            <div className="grid grid-cols-3">
              <label className="col-span-1 flex items-center gap-1 text-sm text-neutral-500">
                <LucideClock className="size-4" />
                <p>Estimated time</p>
              </label>

              <input
                type="time"
                className="w-fit cursor-pointer rounded-xl bg-neutral-300/80 px-2 py-0.5 outline-none placeholder:font-light placeholder:text-neutral-500 hover:bg-neutral-300/50"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3">
              <label className="col-span-1 flex items-center gap-1 text-sm text-neutral-500">
                <LucideRepeat className="size-4" />
                <p>Repeats</p>
              </label>

              <p className="w-fit cursor-pointer rounded-xl bg-neutral-300/80 px-2 py-0.5 hover:bg-neutral-300/50">
                No repeat
              </p>
            </div>

            <div className="my-4 h-0.5 w-full rounded-full bg-neutral-200" />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-500">Notes</label>
              <textarea
                placeholder="Add any notes to the task"
                className="flex w-full resize-none bg-transparent py-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-500"
                rows={1}
                ref={textareaRef}
                onChange={(e) => setNotes(e.target.value)}
                value={notes}
              />
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
