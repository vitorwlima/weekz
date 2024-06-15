import { startOfToday, subDays, eachDayOfInterval, addDays } from 'date-fns'

export const getTodayAndLastPlusNextWeekDays = () => {
  const today = startOfToday()

  const startDate = subDays(today, 7)
  const endDate = addDays(today, 7)

  return eachDayOfInterval({ start: startDate, end: endDate })
}
