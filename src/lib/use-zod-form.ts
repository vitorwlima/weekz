import { zodResolver } from '@hookform/resolvers/zod'
import type { UseFormProps } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

type UseZedForm<FormSchema extends z.ZodType> = Omit<
  UseFormProps<FormSchema['_input']>,
  'resolver'
> & {
  schema: FormSchema;
  onSubmit: (data: FormSchema['_output']) => void;
};

export const useZodForm = <FormSchema extends z.ZodType>({
  schema,
  onSubmit,
  ...props
}: UseZedForm<FormSchema>) => {
  const { handleSubmit, ...form } = useForm<FormSchema['_input']>({
    ...props,
    resolver: zodResolver(schema),
  })

  return { ...form, handleSubmit: handleSubmit(onSubmit) }
}
