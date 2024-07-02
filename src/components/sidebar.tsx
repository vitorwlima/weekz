'use client'

import { UserButton } from '@clerk/nextjs'
import {
  LucideBrain,
  LucideCalendar,
  LucideLayoutGrid,
  LucideSearch,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AddTaskInput } from './add-task-input'
import clsx from 'clsx'
import { Task } from './task'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { useGetTasks } from '~/lib/use-get-tasks'

export const Sidebar = () => {
  const data = useGetTasks()
  const pathname = usePathname()
  const { setNodeRef } = useSortable({
    id: 'braindump',
    data: {
      type: 'braindump',
    },
  })

  const tasks = data?.filter((task) => task.isBrainDump) ?? []

  return (
    <div className="hide-scroll flex h-screen w-96 min-w-96 flex-col overflow-hidden border-r border-neutral-300 p-6">
      <div className="flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">weekz</h1>
          <UserButton />
        </header>

        <label htmlFor="search" className="relative mb-6">
          <LucideSearch
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search or jump to"
            className="w-full rounded-xl border border-neutral-300 bg-transparent p-3 py-2 pl-10 outline-none placeholder:font-light placeholder:text-neutral-400"
          />
        </label>

        <nav className="mb-12 flex flex-col gap-2">
          <Link
            href="/"
            className={clsx(
              'flex items-center gap-2 rounded-xl p-3 py-2 transition-all hover:bg-neutral-50 hover:shadow',
              pathname === '/' ? 'bg-neutral-50 shadow' : 'text-neutral-500',
            )}
          >
            <LucideLayoutGrid className="size-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/planner"
            className={clsx(
              'flex items-center gap-2 rounded-xl p-3 py-2 transition-all hover:bg-neutral-50 hover:shadow',
              pathname === '/planner'
                ? 'bg-neutral-50 shadow'
                : 'text-neutral-500',
            )}
          >
            <LucideCalendar className="size-5" />
            <span>Planner</span>
          </Link>
        </nav>

        <header className="mb-4 flex items-center justify-between text-neutral-500">
          <h3 className="flex items-center gap-2">
            <LucideBrain />
            <span>BRAIN DUMP</span>
          </h3>
          <p className="text-sm">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </header>

        <AddTaskInput isBrainDumpTask />
      </div>

      <SortableContext id="braindump" items={tasks.map((task) => task.id)}>
        <ul
          className="mt-2 flex h-full flex-col gap-2 overflow-y-scroll"
          ref={setNodeRef}
        >
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </ul>
      </SortableContext>
    </div>
  )
}
