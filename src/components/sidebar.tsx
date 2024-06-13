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

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-96 min-w-96 flex-col border-r border-neutral-300 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">dayprime</h1>
        <UserButton />
      </header>

      <label htmlFor="search" className="relative mb-6">
        <LucideSearch
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
        />

        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search or jump to"
          className="w-full rounded-xl border border-neutral-400 bg-transparent p-3 py-2 pl-10 outline-none placeholder:font-light placeholder:text-neutral-500"
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

      <section>
        <header className="mb-4 flex items-center justify-between text-neutral-500">
          <h3 className="flex items-center gap-2">
            <LucideBrain />
            <span>BRAIN DUMP</span>
          </h3>
          <p className="text-sm">2 tasks</p>
        </header>

        <AddTaskInput isBrainDumpTask />
      </section>
    </div>
  )
}
