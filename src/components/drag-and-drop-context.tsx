'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Task } from '~/components/task'
import { getTodayAndLastPlusNextWeekDays } from '~/lib/get-today-and-last-plus-next-week-days'
import { useGetTasks } from '~/lib/useGetTasks'
import { type RouterOutputs, api } from '~/trpc/react'

type DraggingData = {
  taskId: string;
  tasks: RouterOutputs['task']['getAll'];
};

type Props = {
  children: React.ReactNode;
};

export const DragAndDropContext: React.FC<Props> = ({ children }) => {
  const dates = getTodayAndLastPlusNextWeekDays()
  const [draggingData, setDraggingData] = useState<DraggingData | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )
  const utils = api.useUtils()
  const tasks = useGetTasks()
  const { mutate: mutateDragToTask } = api.task.dragToTask.useMutation({
    onError: async () => {
      await utils.task.getAll.invalidate()
    },
  })

  const momentarilyUpdateTasks = (tasks?: RouterOutputs['task']['getAll']) => {
    utils.task.getAll.setData(
      { dates: dates.map((date) => format(date, 'dd/MM/yyyy')) },
      tasks ?? [],
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setDraggingData({
          taskId: active.id as string,
          tasks: [...(tasks ?? [])],
        })
      }}
      onDragOver={({ active, over }) => {
        if (!over?.data.current) return
        if (active.id === over.id) return

        const overCurrent = over.data.current
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const overContainerId = overCurrent.sortable.containerId as string
        const overType = overCurrent.type as string

        const tasksInContainer = tasks.filter((task) => {
          const overTask = tasks.find((task) => task.id === over.id)
          if (overTask?.isBrainDump) {
            return task.isBrainDump
          }

          return task.date === overContainerId && !task.isBrainDump
        })

        if (overType === 'task') {
          const containerTasksOrder = arrayMove(
            tasksInContainer,
            tasksInContainer.findIndex((task) => task.id === active.id),
            tasksInContainer.findIndex((task) => task.id === over.id),
          )
            .map((task) => task.id)
            .reverse()

          momentarilyUpdateTasks(
            tasks
              ?.map((task) =>
                task.id === active.id
                  ? {
                      ...task,
                      date:
                        overContainerId === 'braindump'
                          ? task.date
                          : overContainerId,
                      isBrainDump: overContainerId === 'braindump',
                    }
                  : task,
              )
              .map((task) => {
                if (containerTasksOrder.includes(task.id)) {
                  return {
                    ...task,
                    order: containerTasksOrder.indexOf(task.id) + 1,
                  }
                }

                return task
              }),
          )
        }

        if (overType === 'day') {
          momentarilyUpdateTasks(
            tasks?.map((task) =>
              task.id === active.id
                ? {
                    ...task,
                    date: over.id as string,
                    isBrainDump: false,
                    order: 0,
                  }
                : task,
            ),
          )
        }

        if (overType === 'braindump') {
          momentarilyUpdateTasks(
            tasks?.map((task) =>
              task.id === active.id
                ? {
                    ...task,
                    isBrainDump: true,
                    order: 0,
                  }
                : task,
            ),
          )
        }
      }}
      onDragEnd={({ active, over }) => {
        setDraggingData(null)

        const draggedTask = active.data.current!
          .task as RouterOutputs['task']['getAll'][number]
        const taskIsTheSame = Object.is(
          draggedTask,
          draggingData?.tasks.find((task) => task.id === active.id),
        )

        if (!over?.data.current) return
        if (taskIsTheSame) return

        const tasksInContainer = draggedTask.isBrainDump
          ? tasks.filter((task) => task.isBrainDump)
          : tasks.filter(
              (task) => task.date === draggedTask.date && !task.isBrainDump,
            )

        const orderUpdates = tasksInContainer.map((task) => ({
          id: task.id,
          order: task.order,
        }))

        return mutateDragToTask({
          id: draggedTask.id,
          date: draggedTask.date,
          isBrainDump: draggedTask.isBrainDump,
          orderUpdates,
        })
      }}
    >
      {children}

      {createPortal(
        <DragOverlay>
          {!!draggingData && (
            <Task
              key={tasks.find((task) => task.id === draggingData.taskId)!.id}
              task={tasks.find((task) => task.id === draggingData.taskId)!}
            />
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
