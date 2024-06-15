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
import { type RouterOutputs } from '~/trpc/react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import * as Popover from '@radix-ui/react-popover'
import { format, isWeekend } from 'date-fns'
import { useTaskDialog } from './use-task-dialog'
import { Frequency } from '@prisma/client'

type Props = {
  task: RouterOutputs['task']['getAll'][number];
  onCreateRepeatingTasks: () => void;
};

const getFrequencyOptions = (date?: Date) => {
  const weeklyDescription = date ? format(date, '\'on\' EEEE') : ''
  const monthlyDescription = date ? format(date, '\'on the\' do') : ''
  const yearlyDescription = date ? format(date, '\'on\' MMM do') : ''

  return [
    { label: 'Does not repeat', value: undefined, visible: true },
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

export const TaskDialog: React.FC<Props> = ({
  task,
  onCreateRepeatingTasks,
}) => {
  const taskFrequency = task.taskRepetition?.frequency ?? undefined
  const {
    isTaskDialogOpen,
    onDialogOpenChange,
    title,
    onTitleChange,
    notes,
    onNotesChange,
    estimatedTime,
    onEstimatedTimeChange,
    taskDateObject,
    handleDeleteTask,
    handleDateChange,
    handleFrequencyChange,
    textareaRef,
  } = useTaskDialog({ task, onCreateRepeatingTasks })

  return (
    <Dialog.Root open={isTaskDialogOpen} onOpenChange={onDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/60" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-100 p-6 outline-none">
          <Dialog.Title asChild>
            <div className="mb-4 flex items-center gap-2">
              <input
                className="w-full bg-transparent text-2xl font-medium outline-none"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
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
                onChange={(e) => onEstimatedTimeChange(e.target.value)}
              />
            </div>

            {!task.isBrainDump && (
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
                          (option) => option.value === taskFrequency,
                        )?.label
                      }
                    </button>
                  </Popover.Trigger>
                  <Popover.Content align="start" asChild>
                    <div className="mt-2 flex flex-col gap-0.5 rounded-xl bg-neutral-200 p-2">
                      {getFrequencyOptions(taskDateObject).map((option) => (
                        <Popover.Close
                          key={option.value ?? 'no_repeat'}
                          className={clsx(!option.visible && 'hidden')}
                          asChild
                        >
                          <button
                            className="flex w-full items-center gap-2 rounded-xl px-2 py-1 text-left hover:bg-neutral-100/60"
                            onClick={() => handleFrequencyChange(option.value)}
                          >
                            {taskFrequency === option.value ? (
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
            )}

            <div className="my-4 h-0.5 w-full rounded-full bg-neutral-200" />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-500">Notes</label>
              <textarea
                placeholder="Add any notes to the task"
                className="flex w-full resize-none bg-transparent py-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-500"
                rows={1}
                ref={textareaRef}
                onChange={(e) => onNotesChange(e.target.value)}
                value={notes}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
