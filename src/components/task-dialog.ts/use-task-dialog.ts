import { useDebounce } from '@uidotdev/usehooks'
import { format, parse } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getFormattedEstimatedTime } from '~/lib/get-formatted-estimated-time'
import { api, type RouterOutputs } from '~/trpc/react'

type UseTaskDialog = {
  task: RouterOutputs['task']['getAll'][number] & { completed?: boolean };
};

export const useTaskDialog = ({ task }: UseTaskDialog) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isTaskDialogOpen = searchParams.get('task') === task.id

  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const [estimatedTime, setEstimatedTime] = useState(
    getFormattedEstimatedTime(task.estimatedTime),
  )

  const debouncedEstimatedTime = useDebounce(estimatedTime, 400)
  const debouncedTitle = useDebounce(title, 400)
  const debouncedNotes = useDebounce(notes, 400)

  const utils = api.useUtils()
  const { mutate: updateTaskMutate } = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const { mutate: deleteTaskMutate } = api.task.delete.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement) => {
      if (node) {
        node.style.height = '0px'
        const scrollHeight = node.scrollHeight
        node.style.height = scrollHeight + 'px'
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes],
  )

  const taskDateObject =
    task.date === 'braindump'
      ? undefined
      : parse(task.date, 'dd/MM/yyyy', new Date())

  const onDialogOpenChange = (value: boolean) => {
    if (value) return router.push(`/planner?task=${task.id}`)
    return router.push('/planner')
  }

  const handleDeleteTask = () => {
    deleteTaskMutate({ id: task.id })
  }

  const handleDateChange = (date?: Date) => {
    if (date === undefined) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      frequency: task.frequency,
      estimatedTime: task.estimatedTime ?? undefined,
      date: format(date, 'dd/MM/yyyy'),
      notes: task.notes,
    })
  }

  const handleFrequencyChange = (frequency: string) => {
    if (frequency === task.frequency) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      frequency,
      estimatedTime: task.estimatedTime,
      date: task.date,
      notes: task.notes,
    })
  }

  useEffect(() => {
    const estimatedTime = debouncedEstimatedTime
      ? debouncedEstimatedTime
          .split(':')
          .reduce((acc, cur) => acc * 60 + Number(cur), 0)
      : null

    if (estimatedTime === task.estimatedTime || Number.isNaN(estimatedTime))
      return

    updateTaskMutate(
      {
        id: task.id,
        title: task.title,
        frequency: task.frequency,
        estimatedTime,
        date: task.date,
        notes: task.notes,
      },
      {
        onSuccess: (data) => {
          setEstimatedTime(getFormattedEstimatedTime(data.estimatedTime))
        },
      },
    )
  }, [debouncedEstimatedTime, task, updateTaskMutate])

  useEffect(() => {
    if (debouncedTitle === task.title) return

    updateTaskMutate({
      id: task.id,
      title: debouncedTitle,
      estimatedTime: task.estimatedTime,
      date: task.date,
      frequency: task.frequency,
      notes: task.notes,
    })
  }, [debouncedTitle, task, updateTaskMutate])

  useEffect(() => {
    if (debouncedNotes === task.notes) return

    updateTaskMutate({
      id: task.id,
      title: task.title,
      estimatedTime: task.estimatedTime,
      date: task.date,
      frequency: task.frequency,
      notes: debouncedNotes,
    })
  }, [debouncedNotes, task, updateTaskMutate])

  return {
    isTaskDialogOpen,
    onDialogOpenChange,
    title,
    onTitleChange: (value: string) => setTitle(value),
    notes,
    onNotesChange: (value: string) => setNotes(value),
    estimatedTime,
    onEstimatedTimeChange: (value: string) => setEstimatedTime(value),
    taskDateObject,
    handleDeleteTask,
    handleDateChange,
    handleFrequencyChange,
    textareaRef,
  }
}
