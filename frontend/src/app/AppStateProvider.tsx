import React, { createContext, useContext, useState } from 'react';

interface AppState {
  isSubmitShiftOpen: boolean;
  setSubmitShiftOpen: (open: boolean) => void;
  isAddVenueOpen: boolean;
  setAddVenueOpen: (open: boolean) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isSubmitShiftOpen, setSubmitShiftOpen] = useState(false);
  const [isAddVenueOpen, setAddVenueOpen] = useState(false);

  const value: AppState = {
    isSubmitShiftOpen,
    setSubmitShiftOpen,
    isAddVenueOpen,
    setAddVenueOpen,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
