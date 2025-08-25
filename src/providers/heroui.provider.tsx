// src/providers/heroui.provider.tsx

"use client";
// import "client-only";

import { HeroUIProvider } from '@heroui/react'

export function HerouiProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider>
            {children}
        </HeroUIProvider>
    )
}