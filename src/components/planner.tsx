'use client'

import { format } from 'date-fns'
import { DayBlock } from './day-block'
import { api } from '~/trpc/react'
import { TaskDialog } from './task-dialog'
import { getTodayAndLastPlusNextWeekDays } from '~/lib/get-today-and-last-plus-next-week-days'
import { useGetTasks } from '~/lib/useGetTasks'

type Props = {
  handleScroll: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
};

export const Planner: React.FC<Props> = ({
  handleScroll,
  scrollContainerRef,
}) => {
  const dates = getTodayAndLastPlusNextWeekDays()
  const utils = api.useUtils()
  const { data: tasks } = useGetTasks()
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

  return (
    <div
      className="flex h-full gap-4 overflow-x-auto overflow-y-hidden"
      ref={scrollContainerRef}
      onScroll={handleScroll}
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
