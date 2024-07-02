import { format } from 'date-fns'
import { api } from '~/trpc/react'
import { getTodayAndLastPlusNextWeekDays } from './get-today-and-last-plus-next-week-days'

export const useGetTasks = () => {
  const dates = getTodayAndLastPlusNextWeekDays()

  const { data } = api.task.getAll.useQuery({
    dates: dates.map((date) => format(date, 'dd/MM/yyyy')),
  })

  return data?.sort((a, b) => b.order - a.order) ?? []
}
