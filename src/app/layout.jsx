import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Budget Journal',
  description: 'Personal Home Budget Journal',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-center" richColors />
        </ThemeRegistry>
      </body>
    </html>
  );
}
