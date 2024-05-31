import '~/styles/globals.css'
import '@fontsource/outfit' 
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import { TRPCReactProvider } from '~/trpc/react'

export const metadata = {
  title: 'dayprime',
  description: 'Time management of the future.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const RootLayout = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}

export default RootLayout