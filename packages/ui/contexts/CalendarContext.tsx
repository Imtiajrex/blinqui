import React, { createContext, useContext, useRef } from 'react'
import { create, createStore, useStore } from 'zustand'

interface CalendarStore {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  navigateMonth: (direction: 'prev' | 'next') => void
}

export const createCalendarStore = () =>
  createStore<CalendarStore>((set) => ({
    currentDate: new Date(),
    setCurrentDate: (date: Date) => set({ currentDate: date }),
    navigateMonth: (direction: 'prev' | 'next') => {
      set((state) => {
        const newDate = new Date(state.currentDate)
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        return { currentDate: newDate }
      })
    },
  }))

type CalendarContextType = ReturnType<typeof createCalendarStore>

const CalendarContext = createContext<CalendarContextType | null>(null)

export const CalendarProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const calendarStore = createCalendarStore()

  return (
    <CalendarContext.Provider value={calendarStore}>
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarContext = (selector: (state: CalendarStore) => any) => {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider')
  }
  return useStore(context, selector)
}
