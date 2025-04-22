import './globals.css';

export const metadata = {
  title: 'IHG Pattern Authentication',
  description: 'Two-factor authentication using pattern recognition for IHG',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}