'use client'

import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import {
  LucideCalendar,
  LucideCheck,
  LucideClock,
  LucideRepeat,
  LucideTrash,
} from 'lucide-react'
import { api, type RouterOutputs } from '~/trpc/react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import * as Popover from '@radix-ui/react-popover'
import { format, parse, isWeekend } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { Frequency } from '~/lib/frequency'
import { getFormattedEstimatedTime } from '~/lib/get-formatted-estimated-time'

type Props = {
  task: RouterOutputs['task']['getAll'][number] & { completed?: boolean };
};

const getFrequencyOptions = (date?: Date) => {
  const weeklyDescription = date ? format(date, '\'on\' EEEE') : ''
  const monthlyDescription = date ? format(date, '\'on the\' do') : ''
  const yearlyDescription = date ? format(date, '\'on\' MMM do') : ''

  return [
    { label: 'Does not repeat', value: Frequency.NO_REPEAT, visible: true },
    { label: 'Every day', value: Frequency.DAILY, visible: true },
    {
      label: 'Every weekday',
      value: Frequency.WEEKDAYS,
      description: 'Mon - Fri',
      visible: !!date && !isWeekend(date),
    },
    {
      label: 'Every weekend day',
      value: Frequency.WEEKENDS,
      description: 'Sat & Sun',
      visible: !!date && isWeekend(date),
    },
    {
      label: 'Every week',
      value: Frequency.WEEKLY,
      description: weeklyDescription,
      visible: true,
    },
    {
      label: 'Every month',
      value: Frequency.MONTHLY,
      description: monthlyDescription,
      visible: true,
    },
    {
      label: 'Every year',
      value: Frequency.YEARLY,
      description: yearlyDescription,
      visible: true,
    },
  ]
}

export const TaskDialog: React.FC<Props> = ({ task }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isTaskDialogOpen = searchParams.get('task') === task.id
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const [estimatedTime, setEstimatedTime] = useState(
    getFormattedEstimatedTime(task.estimatedTime),
  )
  const utils = api.useUtils()
  const { mutate: updateTaskMutate } = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const { mutate: deleteTaskMutate } = api.task.delete.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const debouncedEstimatedTime = useDebounce(estimatedTime, 400)
  const debouncedTitle = useDebounce(title, 400)
  const debouncedNotes = useDebounce(notes, 400)

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement) => {
      if (node) {
        node.style.height = '0px'
        const scrollHeight = node.scrollHeight
        node.style.height = scrollHeight + 'px'
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes],
  )

  const taskDateObject =
    task.date === 'braindump'
      ? undefined
      : parse(task.date, 'dd/MM/yyyy', new Date())

  const handleDeleteTask = () => {
    deleteTaskMutate({ id: task.id })
  }

  const handleDateChange = (date?: Date) => {
    if (date === undefined) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      frequency: task.frequency,
      estimatedTime: task.estimatedTime ?? undefined,
      date: format(date, 'dd/MM/yyyy'),
      notes: task.notes,
    })
  }

  const onFrequencyChange = (frequency: string) => {
    if (frequency === task.frequency) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      frequency,
      estimatedTime: task.estimatedTime,
      date: task.date,
      notes: task.notes,
    })
  }

  const handleDialogOpenChange = (value: boolean) => {
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
        notes: task.notes,
      },
      {
        onSuccess: (data) => {
          setEstimatedTime(getFormattedEstimatedTime(data.estimatedTime))
        },
      },
    )
  }, [debouncedEstimatedTime, task, updateTaskMutate])

  useEffect(() => {
    if (debouncedTitle === task.title) return

    updateTaskMutate({
      id: task.id,
      title: debouncedTitle,
      estimatedTime: task.estimatedTime,
      date: task.date,
      frequency: task.frequency,
      notes: task.notes,
    })
  }, [debouncedTitle, task, updateTaskMutate])

  useEffect(() => {
    if (debouncedNotes === task.notes) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      estimatedTime: task.estimatedTime,
      date: task.date,
      frequency: task.frequency,
      notes: debouncedNotes,
    })
  }, [debouncedNotes, task, updateTaskMutate])

  return (
    <Dialog.Root open={isTaskDialogOpen} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/60" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-100 p-6 outline-none">
          <Dialog.Title asChild>
            <div className="mb-4 flex items-center gap-2">
              <input
                className="w-full bg-transparent text-2xl font-medium outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                className="flex items-center justify-center"
                onClick={() => handleDeleteTask()}
              >
                <LucideTrash className="size-3" />
              </button>
            </div>
          </Dialog.Title>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3">
              <label className="col-span-1 flex items-center gap-2 text-sm text-neutral-500">
                <LucideCalendar className="size-4" />
                <p>Task date</p>
              </label>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="w-fit rounded-xl bg-neutral-300/80 px-2 py-0.5 hover:bg-neutral-300/50">
                    {taskDateObject === undefined
                      ? 'Date not defined'
                      : format(taskDateObject, 'MMMM do, yyyy')}
                  </button>
                </Popover.Trigger>
                <Popover.Content align="start">
                  <DayPicker
                    mode="single"
                    selected={taskDateObject}
                    onSelect={handleDateChange}
                    className="rounded-lg bg-neutral-50 p-2"
                  />
                </Popover.Content>
              </Popover.Root>
            </div>

            <div className="grid grid-cols-3">
              <label className="col-span-1 flex items-center gap-2 text-sm text-neutral-500">
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
              <label className="col-span-1 flex items-center gap-2 text-sm text-neutral-500">
                <LucideRepeat className="size-4" />
                <p>Repeats</p>
              </label>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="w-fit rounded-xl bg-neutral-300/80 px-2 py-0.5 outline-none hover:bg-neutral-300/50">
                    {
                      getFrequencyOptions(taskDateObject).find(
                        (option) =>
                          option.value === (task.frequency as Frequency),
                      )?.label
                    }
                  </button>
                </Popover.Trigger>
                <Popover.Content align="start" asChild>
                  <div className="mt-2 flex flex-col gap-0.5 rounded-xl bg-neutral-200 p-2">
                    {getFrequencyOptions(taskDateObject).map((option) => (
                      <Popover.Close
                        key={option.value}
                        className={clsx(!option.visible && 'hidden')}
                        asChild
                      >
                        <button
                          className="flex w-full items-center gap-2 rounded-xl px-2 py-1 text-left hover:bg-neutral-100/60"
                          onClick={() => onFrequencyChange(option.value)}
                        >
                          {(task.frequency as Frequency) === option.value ? (
                            <LucideCheck className="size-3" />
                          ) : (
                            <div className="size-3" />
                          )}
                          <div className="flex gap-1">
                            <span className="text-base">{option.label}</span>
                            <span className="text-xs leading-6 text-neutral-600">
                              {option.description
                                ? `(${option.description})`
                                : ''}
                            </span>
                          </div>
                        </button>
                      </Popover.Close>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Root>
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
