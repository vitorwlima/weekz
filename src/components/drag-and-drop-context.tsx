'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
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
  const utils = api.useUtils()
  const { data: tasks } = useGetTasks()
  const [draggingData, setDraggingData] = useState<DraggingData | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

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

        if (overType === 'task') {
          momentarilyUpdateTasks(
            tasks?.map((task) =>
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
            ),
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
                  }
                : task,
            ),
          )
        }
      }}
      onDragEnd={() => {
        momentarilyUpdateTasks(draggingData?.tasks)
        setDraggingData(null)
      }}
    >
      {children}

      {createPortal(
        <DragOverlay>
          {!!draggingData && (
            <Task
              task={tasks!.find((task) => task.id === draggingData.taskId)!}
            />
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
