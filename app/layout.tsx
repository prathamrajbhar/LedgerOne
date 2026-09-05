export const metadata = {
  title: 'LedgerOne - Accounting System',
  description: 'Production-grade accounting system for small businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
