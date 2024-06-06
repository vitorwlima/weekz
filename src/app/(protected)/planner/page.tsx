'use client'

import { AddTaskInput } from '~/app/components/add-task-input'
import { PageIntroduction } from '~/app/components/page-introduction'

const getTodayAndLastWeekDaysAndNextWeekDays = () => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
}

const Planner = () => {
  const todayAndLastWeekAndNextWeek = getTodayAndLastWeekDaysAndNextWeekDays()

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
        {todayAndLastWeekAndNextWeek.map((date) => (
          <div key={date} className="w-72 min-w-72 p-4">
            <header className="mb-2 flex flex-col">
              <p className="text-2xl font-semibold">Monday</p>
              <p className="text-sm font-light text-neutral-800">January 11</p>
            </header>

            <AddTaskInput id={`task-${date}`} />
          </div>
        ))}
      </div>
    </main>
  )
}

export default Planner
