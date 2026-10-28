import React, { createContext, useContext, useState } from 'react';
import { initialVenues } from '@/mocks/venues';
import { initialEmployeeShifts } from '@/mocks/shifts';
import { initialAdjustments } from '@/mocks/adjustments';
import type { AdjustmentRequest, EmployeeShift, Venue } from '@/types';

interface AppState {
  venues: Venue[];
  addVenue: (venue: Omit<Venue, 'id' | 'staffCount'>) => void;

  employeeShifts: EmployeeShift[];
  addEmployeeShift: (shift: Omit<EmployeeShift, 'id'>) => void;

  adjustments: AdjustmentRequest[];
  setAdjustments: (requests: AdjustmentRequest[]) => void;
  pendingAdjustments: number;

  isSubmitShiftOpen: boolean;
  setSubmitShiftOpen: (open: boolean) => void;
  isAddVenueOpen: boolean;
  setAddVenueOpen: (open: boolean) => void;

  isCanvasMode: boolean;
  setCanvasMode: (on: boolean) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [employeeShifts, setEmployeeShifts] = useState<EmployeeShift[]>(initialEmployeeShifts);
  const [adjustments, setAdjustments] = useState<AdjustmentRequest[]>(initialAdjustments);
  const [isSubmitShiftOpen, setSubmitShiftOpen] = useState(false);
  const [isAddVenueOpen, setAddVenueOpen] = useState(false);
  const [isCanvasMode, setCanvasMode] = useState(false);

  const value: AppState = {
    venues,
    addVenue: (venue) =>
      setVenues((prev) => [...prev, { id: Date.now().toString(), staffCount: 1, ...venue }]),

    employeeShifts,
    addEmployeeShift: (shift) =>
      setEmployeeShifts((prev) => [{ id: Date.now().toString(), ...shift }, ...prev]),

    adjustments,
    setAdjustments,
    pendingAdjustments: adjustments.filter((a) => a.status === 'pending').length,

    isSubmitShiftOpen,
    setSubmitShiftOpen,
    isAddVenueOpen,
    setAddVenueOpen,

    isCanvasMode,
    setCanvasMode,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
