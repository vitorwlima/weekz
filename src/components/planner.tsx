'use client'

import { format, isWeekend, getDay, parse, getDate, getMonth } from 'date-fns'
import { DayBlock } from './day-block'
import { type RouterOutputs, api } from '~/trpc/react'
import { TaskDialog } from './task-dialog'

type Task = RouterOutputs['task']['getAll'][number];
type Completion = RouterOutputs['task']['getCompletions'][number];

type Props = {
  dates: Date[];
  handleScroll: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
};

const getTasksByFrequency = (tasks: Task[], date: Date) => {
  return tasks.filter((task) => {
    const taskDate = parse(task.date, 'dd/MM/yyyy', new Date())

    if (task.date === format(date, 'dd/MM/yyyy')) return true
    if (task.frequency === 'daily') return true
    if (task.frequency === 'weekdays' && !isWeekend(date)) return true
    if (task.frequency === 'weekends' && isWeekend(date)) return true
    if (task.frequency === 'weekly' && getDay(date) === getDay(taskDate))
      return true
    if (task.frequency === 'monthly' && getDate(date) === getDate(taskDate))
      return true
    if (
      task.frequency === 'yearly' &&
      getDate(date) === getDate(taskDate) &&
      getMonth(date) === getMonth(taskDate)
    )
      return true
  })
}

const getTasksByDate = (
  tasks: Task[],
  completions: Completion[],
  date: Date,
) => {
  return getTasksByFrequency(tasks, date).map((task) => {
    const completion = completions.find(
      (completion) =>
        completion.taskOrSubtaskId === task.id &&
        completion.date === format(date, 'dd/MM/yyyy'),
    )

    return {
      ...task,
      completed: completion?.completed ?? false,
    }
  })
}

export const Planner: React.FC<Props> = ({
  dates,
  handleScroll,
  scrollContainerRef,
}) => {
  const { data: completions } = api.task.getCompletions.useQuery()
  const { data } = api.task.getAll.useQuery()

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
          tasks={getTasksByDate(data ?? [], completions ?? [], date)}
        />
      ))}
      {data?.map((task) => <TaskDialog task={task} key={task.id} />)}
    </div>
  )
}
