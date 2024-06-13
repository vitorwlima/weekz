'use client'

import { format } from 'date-fns'
import { DayBlock } from './day-block'
import { api } from '~/trpc/react'

type Props = {
  dates: Date[];
};

export const Planner: React.FC<Props> = ({ dates }) => {
  const { data } = api.task.getAll.useQuery()

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
        <DayBlock
          key={format(date, 'dd/MM/yyyy')}
          date={date}
          tasks={
            data?.filter((task) => task.date === format(date, 'dd/MM/yyyy')) ??
            []
          }
        />
      ))}
    </div>
  )
}
