import { type Frequency } from '@prisma/client'
import { useDebounce } from '@uidotdev/usehooks'
import { format, getDate, getDay, parse } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getFormattedEstimatedTime } from '~/lib/get-formatted-estimated-time'
import { api, type RouterOutputs } from '~/trpc/react'

type UseTaskDialog = {
  task: RouterOutputs['task']['getAll'][number] & { completed?: boolean };
  onCreateRepeatingTasks: () => void;
};

export const useTaskDialog = ({ task, onCreateRepeatingTasks }: UseTaskDialog) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isTaskDialogOpen = searchParams.get('task') === task.id

  const onDialogOpenChange = (value: boolean) => {
    if (value) return router.push(`/planner?task=${task.id}`)
    return router.push('/planner')
  }

  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const [estimatedTime, setEstimatedTime] = useState(
    getFormattedEstimatedTime(task.estimatedTime),
  )

  const debouncedEstimatedTime = useDebounce(estimatedTime, 400)
  const debouncedTitle = useDebounce(title, 400)
  const debouncedNotes = useDebounce(notes, 400)

  const utils = api.useUtils()
  const { mutate: updateDateMutate } = api.task.updateDate.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const { mutate: updateFrequencyMutate } =
    api.task.updateFrequency.useMutation({
      onSuccess: () => {
        onCreateRepeatingTasks()
      },
    })
  const { mutate: updateTitleMutate } = api.task.updateTitle.useMutation({
    onSuccess: async () => {
      await utils.task.getAll.invalidate()
    },
  })
  const { mutate: updateEstimatedTimeMutate } =
    api.task.updateEstimatedTime.useMutation({
      onSuccess: async () => {
        await utils.task.getAll.invalidate()
      },
    })
  const { mutate: updateNotesMutate } = api.task.updateNotes.useMutation({
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
    task.date === undefined || task.isBrainDump
      ? undefined
      : parse(task.date, 'dd/MM/yyyy', new Date())

  const handleDeleteTask = () => {
    deleteTaskMutate({ id: task.id })
  }

  const handleDateChange = (date?: Date) => {
    if (date === undefined) return

    updateDateMutate({
      id: task.id,
      date: format(date, 'dd/MM/yyyy'),
    })
  }

  const handleFrequencyChange = (frequency: Frequency | undefined) => {
    if (frequency === task.taskRepetition?.frequency) return

    updateFrequencyMutate({
      taskRepetitionId: task.taskRepetition?.id,
      taskId: task.id,
      frequency,
      startDate: task.date,
      title: task.title,
      monthDay: taskDateObject && getDate(taskDateObject),
      weekDay: taskDateObject && getDay(taskDateObject),
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

    updateEstimatedTimeMutate(
      {
        id: task.id,
        estimatedTime,
      },
      {
        onSuccess: (data) => {
          setEstimatedTime(getFormattedEstimatedTime(data.estimatedTime))
        },
      },
    )
  }, [debouncedEstimatedTime, task, updateEstimatedTimeMutate])

  useEffect(() => {
    if (debouncedTitle === task.title) return

    updateTitleMutate({
      id: task.id,
      title: debouncedTitle,
    })
  }, [debouncedTitle, task, updateTitleMutate])

  useEffect(() => {
    if (debouncedNotes === task.notes) return

    updateNotesMutate({
      id: task.id,
      notes: debouncedNotes,
    })
  }, [debouncedNotes, task, updateNotesMutate])

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
