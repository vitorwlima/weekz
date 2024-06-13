import { type RouterOutputs } from '~/trpc/react'

type Props = {
  task: RouterOutputs['task']['getAll'][number];
};

const getFormattedTime = (time: number | null) => {
  if (time === null) return '--:--'

  const hours = Math.floor(time / 60)
  const minutes = time % 60

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
}

export const Task: React.FC<Props> = ({ task }) => {
  return (
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
  )
}
