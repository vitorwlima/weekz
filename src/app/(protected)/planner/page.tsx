'use client'

import { AddTaskInput } from '~/app/components/add-task-input'
import { PageIntroduction } from '~/app/components/page-introduction'
import {
  startOfToday,
  subDays,
  eachDayOfInterval,
  addDays,
  format,
  isToday,
} from 'date-fns'

const getTodayAndLastWeekDaysAndNextWeekDays = () => {
  const today = startOfToday()

  const startDate = subDays(today, 7)
  const endDate = addDays(today, 7)

  return eachDayOfInterval({ start: startDate, end: endDate })
}

const Planner = () => {
  const dates = getTodayAndLastWeekDaysAndNextWeekDays()

  return (
    <main className="flex h-screen flex-col overflow-hidden p-6">
      <PageIntroduction description="Here is your planner" />

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
            <AddTaskInput id={`task-${format(date, 'dd/MM/yyyy')}`} />
          </div>
        ))}
      </div>
    </main>
  )
}

export default Planner
