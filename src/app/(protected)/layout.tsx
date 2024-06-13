import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { Sidebar } from '~/components/sidebar'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>
        <Sidebar />
        {children}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default ProtectedLayout
