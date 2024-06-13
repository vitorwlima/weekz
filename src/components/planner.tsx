'use client'

import { format, isToday } from 'date-fns'
import { AddTaskInput } from './add-task-input'

type Props = {
  dates: Date[];
};

export const Planner: React.FC<Props> = ({ dates }) => {
  return (
    <div
      className="flex h-full gap-4 overflow-auto rounded-xl p-2"
      onWheel={(e) => {
        if (e.deltaY === 0) return

        e.currentTarget.scrollTo({
          left: e.currentTarget.scrollLeft + e.deltaY,
          behavior: 'smooth', // could lag, check here: https://stackoverflow.com/a/75393604
        })
      }}
    >
      {dates.map((date) => (
        <div key={format(date, 'dd/MM/yyyy')} className="w-72 min-w-72 p-4">
          <header className="mb-2 flex flex-col">
            <p className="text-2xl font-semibold">{format(date, 'EEEE')}</p>
            <p className="text-sm font-light text-neutral-800">
              {format(date, 'MMMM d')} {isToday(date) ? '(Today)' : ''}
            </p>
          </header>
          <AddTaskInput
            isBrainDumpTask={false}
            date={format(date, 'dd/MM/yyyy')}
          />
        </div>
      ))}
    </div>
  )
}
