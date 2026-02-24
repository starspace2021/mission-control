export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>Mission Control</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-[#0a0a0f] text-[#fafafa] min-h-screen">
        {children}
      </body>
    </html>
  )
}
