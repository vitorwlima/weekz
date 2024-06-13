'use client'

import { useUser } from '@clerk/nextjs'

type Props = {
  description: string;
};

export const PageIntroduction: React.FC<Props> = ({ description }) => {
  const { user } = useUser()

  return (
    <header className="mb-6 flex flex-col gap-1">
      <h2 className="text-2xl">Hello, {user?.firstName}</h2>
      <p className="text-sm font-light text-neutral-800">{description}</p>
    </header>
  )
}
