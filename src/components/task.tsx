'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { LucideCalendar, LucideCheck } from 'lucide-react'
import { api, type RouterOutputs } from '~/trpc/react'

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
  const utils = api.useUtils()
  const { mutate } = api.task.completeTask.useMutation({
    onSuccess: async () => {
      await utils.task.getCompletions.invalidate()
    },
  })

  const handleOnCheckedChange = (value: Checkbox.CheckedState) => {
    mutate({
      id: task.id,
      date: task.date,
      completed: value as boolean,
    })
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <li
          key={task.id}
          className="cursor-pointer rounded-xl border border-neutral-300 bg-neutral-50 p-4"
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
          <Dialog.Title className="text-2xl font-medium mb-4">
            {task.title}
          </Dialog.Title>

          <form>
            <div>
              <label className="flex items-center gap-1 text-sm text-neutral-500">
                <LucideCalendar className="size-4" />
                <p>Task date</p>
              </label>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
