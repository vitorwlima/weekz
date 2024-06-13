'use client'

import { useUser } from '@clerk/nextjs'
import clsx from 'clsx'

type Props = {
  description: string;
  onClick?: () => void;
};

export const PageIntroduction: React.FC<Props> = ({ description, onClick }) => {
  const { user } = useUser()

  return (
    <header
      className={clsx(
        'mb-6 flex w-fit flex-col gap-1',
        typeof onClick === 'function' ? 'cursor-pointer' : '',
      )}
      onClick={onClick}
    >
      <h2 className="text-2xl">Hello, {user?.firstName}</h2>
      <p className="text-sm font-light text-neutral-800">{description}</p>
    </header>
  )
}
