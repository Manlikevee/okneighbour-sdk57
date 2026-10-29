import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ui/toast-host';
import { LocationProvider } from '@/providers/location-provider';
import { SessionProvider } from '@/providers/session-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <LocationProvider>
          {children}
          <ToastHost />
        </LocationProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
