'use client'

import { format } from 'date-fns'
import { DayBlock } from './day-block'
import { api } from '~/trpc/react'
import { TaskDialog } from './task-dialog'
import { getTodayAndLastPlusNextWeekDays } from '~/lib/get-today-and-last-plus-next-week-days'
import { useGetTasks } from '~/lib/use-get-tasks'
import { useEffect } from 'react'

type Props = {
  handleScroll: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleDragMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleDragStop: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const Planner: React.FC<Props> = ({
  handleScroll,
  scrollContainerRef,
  handleDragStart,
  handleDragMove,
  handleDragStop,
}) => {
  const dates = getTodayAndLastPlusNextWeekDays()
  const utils = api.useUtils()
  const tasks = useGetTasks()
  const { mutate } = api.task.createRepeatingTasks.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })

  const onCreateRepeatingTasks = () => {
    mutate({
      dates: dates.map((date) => format(date, 'dd/MM/yyyy')),
    })
  }

  useEffect(() => {
    mutate({
      dates: dates.map((date) => format(date, 'dd/MM/yyyy')),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="flex h-full gap-4 overflow-x-auto overflow-y-hidden"
      ref={scrollContainerRef}
      onScroll={handleScroll}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragStop}
      onMouseLeave={handleDragStop}
    >
      {dates.map((date) => (
        <DayBlock
          key={format(date, 'dd/MM/yyyy')}
          date={date}
          tasks={
            tasks?.filter(
              (task) =>
                task.date === format(date, 'dd/MM/yyyy') && !task.isBrainDump,
            ) ?? []
          }
        />
      ))}

      {tasks?.map((task) => (
        <TaskDialog
          key={task.id}
          task={task}
          onCreateRepeatingTasks={onCreateRepeatingTasks}
        />
      ))}
    </div>
  )
}
