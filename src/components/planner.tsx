'use client'

import { format } from 'date-fns'
import { DayBlock } from './day-block'
import { api } from '~/trpc/react'

type Props = {
  dates: Date[];
  handleScroll: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
};

export const Planner: React.FC<Props> = ({
  dates,
  handleScroll,
  scrollContainerRef,
}) => {
  const { data: completions } = api.task.getCompletions.useQuery()
  const { data } = api.task.getAll.useQuery()

  const tasks = data?.map((task) => {
    const completion = completions?.find(
      (c) => c.taskOrSubtaskId === task.id && c.date === task.date,
    )

    return {
      ...task,
      completed: completion?.completed ?? false,
    }
  })

  return (
    <div
      className="flex h-full gap-4 overflow-auto"
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      {dates.map((date) => (
        <DayBlock
          key={format(date, 'dd/MM/yyyy')}
          date={date}
          tasks={
            tasks?.filter((task) => task.date === format(date, 'dd/MM/yyyy')) ??
            []
          }
        />
      ))}
    </div>
  )
}
