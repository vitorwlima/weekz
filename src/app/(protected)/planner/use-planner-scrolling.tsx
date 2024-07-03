import { useEffect, useState } from 'react'
import useSmoothHorizontalScroll from 'use-smooth-horizontal-scroll'

const todayPosition = 336 * 7

type DragData =
  | { isMouseDown: false }
  | { isMouseDown: true; startX: number; startScrollLeft: number };

export const usePlannerScrolling = () => {
  const [dragData, setDragData] = useState<DragData>({ isMouseDown: false })
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

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.preventDefault()
    setDragData({
      isMouseDown: true,
      startX: e.pageX - scrollContainerRef.current!.offsetLeft,
      startScrollLeft: scrollContainerRef.current!.scrollLeft,
    })
  }

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    if (!dragData.isMouseDown) return

    const x = e.pageX - scrollContainerRef.current!.offsetLeft
    const scroll = x - dragData.startX
    scrollContainerRef.current!.scrollLeft = dragData.startScrollLeft - scroll
  }

  const handleDragStop = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.preventDefault()
    setDragData({ isMouseDown: false })
  }

  return {
    scrollContainerRef,
    handleScroll,
    handleScrollToToday,
    handleDragStart,
    handleDragMove,
    handleDragStop,
  }
}
