'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import { LucideCheck } from 'lucide-react'
import { api, type RouterOutputs } from '~/trpc/react'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { getFormattedEstimatedTime } from '~/lib/get-formatted-estimated-time'

type Props = {
  task: RouterOutputs['task']['getAll'][number] & { completed?: boolean };
  date: Date | 'braindump';
};

export const Task: React.FC<Props> = ({ task, date }) => {
  const router = useRouter()
  const utils = api.useUtils()
  const { mutate: completeTaskMutate } = api.task.completeTask.useMutation({
    onSuccess: async () => {
      await utils.task.getCompletions.invalidate()
    },
  })

  const handleOnCheckedChange = (value: Checkbox.CheckedState) => {
    if (date === 'braindump') return

    completeTaskMutate({
      id: task.id,
      date: format(date, 'dd/MM/yyyy'),
      completed: value as boolean,
    })
  }

  return (
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
          {getFormattedEstimatedTime(task.estimatedTime)}
        </p>
      </header>
    </li>
  )
}
