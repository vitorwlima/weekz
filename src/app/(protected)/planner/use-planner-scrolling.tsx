import { useEffect } from 'react'
import useSmoothHorizontalScroll from 'use-smooth-horizontal-scroll'

const todayPosition = 336 * 7

export const usePlannerScrolling = () => {
  const { scrollContainerRef, handleScroll } = useSmoothHorizontalScroll()

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ left: todayPosition })
  }, [scrollContainerRef])

  const handleScrollToToday = () => {
    scrollContainerRef.current?.scrollTo({
      left: todayPosition,
      behavior: 'smooth',
    })
  }

  return {
    scrollContainerRef,
    handleScroll,
    handleScrollToToday,
  }
}
