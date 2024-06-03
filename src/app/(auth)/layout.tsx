const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="grid h-screen w-screen place-items-center">
      {children}
    </main>
  )
}

export default AuthLayout
