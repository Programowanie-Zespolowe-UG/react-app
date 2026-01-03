import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Budget Journal',
  description: 'Personal Home Budget Journal',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
