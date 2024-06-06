import { LucidePlus } from 'lucide-react'

type Props = {
  id: string;
};

export const AddTaskInput: React.FC<Props> = ({ id }) => {
  return (
    <label htmlFor={id} className="relative text-sm">
      <LucidePlus className="pointer-events-none absolute left-2 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />

      <input
        type="text"
        name={id}
        id={id}
        placeholder="Add a task"
        className="w-full rounded-xl border border-neutral-400 bg-neutral-50 p-1 pl-8 outline-none placeholder:font-light placeholder:text-neutral-500"
      />
    </label>
  )
}
