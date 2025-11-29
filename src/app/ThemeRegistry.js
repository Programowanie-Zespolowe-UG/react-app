'use client';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NextAppDirEmotionCacheProvider } from './EmotionCache';
import ThemeContextProvider from './context/ThemeContext';

export default function ThemeRegistry({ children }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeContextProvider>
        {children}
      </ThemeContextProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
