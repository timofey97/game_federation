"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Use a more generic approach with React.ComponentProps
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
