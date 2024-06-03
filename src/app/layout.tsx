import '~/styles/globals.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from '~/trpc/react'

export const metadata = {
  title: 'dayprime',
  description: 'Time management of the future.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex h-screen bg-neutral-100 text-neutral-950">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

export default RootLayout
