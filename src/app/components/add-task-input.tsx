import clsx from 'clsx'
import { LucidePlusCircle as LucidePlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  id: string;
};

export const AddTaskInput: React.FC<Props> = ({ id }) => {
  const containerRef = useRef<HTMLLabelElement>(null)
  const [shouldShowTime, setShouldShowTime] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShouldShowTime(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  return (
    <label htmlFor={id} ref={containerRef} className="relative text-sm">
      <LucidePlus
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
      />

      <input
        type="text"
        name={id}
        id={id}
        placeholder="Add a task"
        className="w-full rounded-xl border border-neutral-400 bg-neutral-50 p-3 py-2 pl-10 outline-none placeholder:font-light placeholder:text-neutral-500"
        onFocus={() => setShouldShowTime(true)}
        // TODO: onBlur reset both inputs
      />

      <input
        type="time"
        id={`time-${id}`}
        className={clsx(
          'absolute right-1.5 top-0 w-12 -translate-y-1.5 rounded-lg border border-neutral-400 bg-neutral-50 p-1 text-xs outline-none placeholder:font-light placeholder:text-neutral-500',
          shouldShowTime ? 'block' : 'hidden',
        )}
      />
    </label>
  )
}
