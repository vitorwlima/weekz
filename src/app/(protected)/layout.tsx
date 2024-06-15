'use client'

import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
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
import { Sidebar } from '~/components/sidebar'
import { Task } from '~/components/task'
import { getTodayAndLastPlusNextWeekDays } from '~/lib/get-today-and-last-plus-next-week-days'
import { type RouterOutputs, api } from '~/trpc/react'

type DraggingData = {
  taskId: string;
  tasks: RouterOutputs['task']['getAll'];
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const dates = getTodayAndLastPlusNextWeekDays()
  const utils = api.useUtils()
  const { data: tasks } = api.task.getAll.useQuery({
    dates: dates.map((date) => format(date, 'dd/MM/yyyy')),
  })
  const [draggingData, setDraggingData] = useState<DraggingData | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  return (
    <>
      <SignedIn>
        <DndContext
          sensors={sensors}
          onDragStart={({ active }) => {
            setDraggingData({
              taskId: active.id as string,
              tasks: [...(tasks ?? [])],
            })
          }}
          onDragOver={({ active, over }) => {
            if (!over) return
            if (active.id === over.id) return

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const overContainerId = over.data.current!.sortable.containerId as string

            if (over.data.current!.type === 'task') {
              utils.task.getAll.setData(
                { dates: dates.map((date) => format(date, 'dd/MM/yyyy')) },
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

            if (over.data.current!.type === 'day') {
              utils.task.getAll.setData(
                { dates: dates.map((date) => format(date, 'dd/MM/yyyy')) },
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

            if (over.data.current!.type === 'braindump') {
              utils.task.getAll.setData(
                { dates: dates.map((date) => format(date, 'dd/MM/yyyy')) },
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
            utils.task.getAll.setData(
              {
                dates: dates.map((date) => format(date, 'dd/MM/yyyy')),
              },
              draggingData?.tasks,
            )
            setDraggingData(null)
          }}
        >
          <Sidebar />
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
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default ProtectedLayout
