import './globals.css';

export const metadata = {
  title: 'Prompt Canvas',
  description: 'Prompt Canvas UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
