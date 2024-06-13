import { format, isToday } from 'date-fns'
import { AddTaskInput } from './add-task-input'
import { type RouterOutputs } from '~/trpc/react'

type Props = {
  date: Date;
  tasks: RouterOutputs['task']['getAll'];
};

const getFormattedTime = (time: number | null) => {
  if (time === null) return '--:--'

  const hours = Math.floor(time / 60)
  const minutes = time % 60

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
}

export const DayBlock: React.FC<Props> = ({ date, tasks }) => {
  return (
    <div className="w-80 min-w-80 p-4">
      <header className="mb-2 flex flex-col">
        <p className="text-2xl font-semibold">{format(date, 'EEEE')}</p>
        <p className="text-sm font-light text-neutral-800">
          {format(date, 'MMMM d')} {isToday(date) ? '(Today)' : ''}
        </p>
      </header>
      <AddTaskInput isBrainDumpTask={false} date={format(date, 'dd/MM/yyyy')} />

      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="rounded-xl border border-neutral-300 bg-neutral-50 p-4"
          >
            <header className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="font-light">{task.title}</p>
              </div>
              <p className="rounded-md bg-neutral-300 p-1 text-xs font-light tracking-tighter">
                {getFormattedTime(task.estimatedTime)}
              </p>
            </header>
          </li>
        ))}
      </ul>
    </div>
  )
}
