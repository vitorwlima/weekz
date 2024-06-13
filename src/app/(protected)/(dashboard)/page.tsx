import { format } from 'date-fns'
import { PageIntroduction } from '~/components/page-introduction'

const Dashboard = () => {
  const today = format(new Date(), 'EEE, MMM d')

  return (
    <main className="flex h-screen flex-col overflow-hidden p-6">
      <PageIntroduction description={today} />

      <p className="mt-8">Dashboard in construction.</p>
    </main>
  )
}

export default Dashboard
