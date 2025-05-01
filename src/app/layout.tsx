import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning предотвращает лишние warnings */}
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  )
}