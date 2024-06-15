import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { DragAndDropContext } from '~/components/drag-and-drop-context'
import { Sidebar } from '~/components/sidebar'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>
        <DragAndDropContext>
          <Sidebar />
          {children}
        </DragAndDropContext>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default ProtectedLayout
