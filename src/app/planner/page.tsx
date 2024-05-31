'use client'

import { LucidePlus } from 'lucide-react'

const getTodayAndLastWeekDaysAndNextWeekDays = () => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
}

const Planner = () => {
  const todayAndLastWeekAndNextWeek = getTodayAndLastWeekDaysAndNextWeekDays()

  return (
    <main className="flex h-screen flex-col overflow-hidden p-6">
      <header className="mb-6 flex flex-col gap-1">
        <h2 className="text-2xl">Hello, Vitor</h2>
        <p className="text-sm font-light text-neutral-800">
          Here is your planner
        </p>
      </header>

      <div
        className="flex h-full gap-4 overflow-auto rounded-xl bg-neutral-50 p-2"
        onWheel={(e) => {
          if (e.deltaY === 0) return

          e.currentTarget.scrollTo({
            left: e.currentTarget.scrollLeft + e.deltaY,
            behavior: 'smooth', // could lag, check here: https://stackoverflow.com/a/75393604
          })
        }}
      >
        {todayAndLastWeekAndNextWeek.map((date) => (
          <div key={date} className="w-56 min-w-56 p-4">
            <header className="mb-2 flex flex-col">
              <p className="text-xl">Monday</p>
              <p className="text-sm font-light text-neutral-800">January 11</p>
            </header>

            <label htmlFor="braindump-task" className="relative text-sm">
              <LucidePlus className="pointer-events-none absolute left-2 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />

              <input
                type="text"
                name="braindump-task"
                id="braindump-task"
                placeholder="Add a task"
                className="w-full rounded-xl border border-neutral-400 bg-neutral-50 p-1 pl-8 outline-none placeholder:font-light placeholder:text-neutral-500"
              />
            </label>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Planner
