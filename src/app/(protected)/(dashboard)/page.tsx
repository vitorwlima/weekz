'use client'

import { useUser } from '@clerk/nextjs'

const Dashboard = () => {
  const { user } = useUser()
  return (
    <main className="flex h-screen flex-col overflow-hidden p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl">Hello, {user?.firstName}</h2>
        <p className="text-sm text-neutral-800">Fri, May 31</p>
      </header>

      <p className="mt-8">Dashboard in construction.</p>
    </main>
  )
}

export default Dashboard
