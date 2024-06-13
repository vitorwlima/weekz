'use client'

import { PageIntroduction } from '~/components/page-introduction'
import { startOfToday, subDays, eachDayOfInterval, addDays } from 'date-fns'
import { Planner } from '~/components/planner'
import { usePlannerScrolling } from './use-planner-scrolling'

const getTodayAndLastWeekDaysAndNextWeekDays = () => {
  const today = startOfToday()

  const startDate = subDays(today, 7)
  const endDate = addDays(today, 7)

  return eachDayOfInterval({ start: startDate, end: endDate })
}

const PlannerPage = () => {
  const { handleScroll, handleScrollToToday, scrollContainerRef } =
    usePlannerScrolling()
  const dates = getTodayAndLastWeekDaysAndNextWeekDays()

  return (
    <main className="flex h-screen flex-col overflow-hidden p-6">
      <PageIntroduction
        description="Here is your planner"
        onClick={handleScrollToToday}
      />
      <Planner
        dates={dates}
        handleScroll={handleScroll}
        scrollContainerRef={
          scrollContainerRef as React.RefObject<HTMLDivElement>
        }
      />
    </main>
  )
}

export default PlannerPage
