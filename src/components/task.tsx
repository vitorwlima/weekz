'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import { LucideCheck } from 'lucide-react'
import { api, type RouterOutputs } from '~/trpc/react'
import { getFormattedEstimatedTime } from '~/lib/get-formatted-estimated-time'
import { useRouter } from 'next/navigation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  task: RouterOutputs['task']['getAll'][number];
};

export const Task: React.FC<Props> = ({ task }) => {
  const router = useRouter()
  const utils = api.useUtils()
  const { mutate: completeTaskMutate } = api.task.completeTask.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const handleOnCheckedChange = (value: Checkbox.CheckedState) => {
    if (task.isBrainDump) return

    completeTaskMutate({
      id: task.id,
      completed: value as boolean,
    })
  }

  return (
    <li
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
      }}
      className={clsx(
        'flex cursor-pointer items-start justify-between gap-2 rounded-xl border border-neutral-300 bg-neutral-50 p-4',
        isDragging && 'opacity-50',
      )}
      onClick={() => router.push(`/planner?task=${task.id}`)}
    >
      <div className="flex items-start gap-2">
        {!task.isBrainDump && (
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
    </li>
  )
}
