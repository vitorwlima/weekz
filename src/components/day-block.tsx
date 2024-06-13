import { format, isToday } from 'date-fns'
import { AddTaskInput } from './add-task-input'
import { type RouterOutputs } from '~/trpc/react'
import { Task } from './task'

type Task = RouterOutputs['task']['getAll'][number] & { completed: boolean };

type Props = {
  date: Date;
  tasks: Task[];
};

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

      <ul className="mt-2 flex flex-col gap-2">
        {tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </ul>
    </div>
  )
}
