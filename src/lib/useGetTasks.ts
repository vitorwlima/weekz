import { format } from 'date-fns'
import { api } from '~/trpc/react'
import { getTodayAndLastPlusNextWeekDays } from './get-today-and-last-plus-next-week-days'

export const useGetTasks = () => {
  const dates = getTodayAndLastPlusNextWeekDays()

  return api.task.getAll.useQuery({
    dates: dates.map((date) => format(date, 'dd/MM/yyyy')),
  })
}
