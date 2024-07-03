'use client'

import { PageIntroduction } from '~/components/page-introduction'
import { Planner } from '~/components/planner'
import { usePlannerScrolling } from './use-planner-scrolling'

const PlannerPage = () => {
  const {
    handleScroll,
    handleScrollToToday,
    scrollContainerRef,
    handleDragStart,
    handleDragMove,
    handleDragStop,
  } = usePlannerScrolling()

  return (
    <main className="flex h-screen flex-col overflow-hidden p-6">
      <PageIntroduction
        description="Here is your planner"
        onClick={handleScrollToToday}
      />
      <Planner
        handleScroll={handleScroll}
        handleDragStart={handleDragStart}
        handleDragMove={handleDragMove}
        handleDragStop={handleDragStop}
        scrollContainerRef={
          scrollContainerRef as React.RefObject<HTMLDivElement>
        }
      />
    </main>
  )
}

export default PlannerPage
