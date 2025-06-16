import { memo, useCallback, useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Picker, { PickerData } from './WheelPicker'
import { cn } from '../lib/utils'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

// Shared className types
interface BaseClassNames {
  className?: string
  textClassName?: string
}

interface DayClassNames extends BaseClassNames {
  dayClassName?: string
  dayTextClassName?: string
  selectedDayClassName?: string
  selectedDayTextClassName?: string
  todayClassName?: string
  todayTextClassName?: string
  otherMonthDayClassName?: string
  otherMonthDayTextClassName?: string
  dayHeaderClassName?: string
  dayHeaderTextClassName?: string
}

interface HeaderClassNames extends BaseClassNames {
  headerClassName?: string
  monthYearTextClassName?: string
  navigationButtonClassName?: string
  navigationButtonTextClassName?: string
}

interface ModalClassNames extends BaseClassNames {
  modalClassName?: string
  modalContentClassName?: string
  modalHeaderClassName?: string
  modalHeaderTextClassName?: string
  modalButtonClassName?: string
  modalButtonTextClassName?: string
  pickerContainerClassName?: string
}

// Component Props Types
interface CalendarDayProps
  extends Pick<
    DayClassNames,
    | 'dayClassName'
    | 'dayTextClassName'
    | 'selectedDayClassName'
    | 'selectedDayTextClassName'
    | 'todayClassName'
    | 'todayTextClassName'
    | 'otherMonthDayClassName'
    | 'otherMonthDayTextClassName'
  > {
  date: Date
  selected: boolean
  today: boolean
  currentMonth: boolean
  onSelect: (date: Date) => void
}

interface DayHeaderProps
  extends Pick<DayClassNames, 'dayHeaderClassName' | 'dayHeaderTextClassName'> {
  day: string
}

interface CalendarHeaderProps extends HeaderClassNames {
  currentDate: Date
  onMonthYearClick: () => void
  onNavigateMonth: (direction: 'prev' | 'next') => void
}

interface CalendarGridProps extends DayClassNames {
  currentDate: Date
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface MonthYearPickerProps extends ModalClassNames {
  visible: boolean
  currentDate: Date
  onClose: () => void
  onDateChange: (date: Date) => void
}

interface DatePickerProps
  extends DayClassNames,
    HeaderClassNames,
    ModalClassNames {
  initialDate?: Date
  onDateChange?: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
}

// Utility components
const CalendarDay = memo(
  ({
    date,
    selected,
    today,
    currentMonth,
    onSelect,
    dayClassName,
    dayTextClassName,
    selectedDayClassName,
    selectedDayTextClassName,
    todayClassName,
    todayTextClassName,
    otherMonthDayClassName,
    otherMonthDayTextClassName,
  }: CalendarDayProps) => (
    <TouchableOpacity
      onPress={() => onSelect(date)}
      className={cn('h-10 w-10 items-center justify-center', dayClassName)}
    >
      <View
        className={cn(
          'h-8 w-8 items-center justify-center rounded-full',
          selected && cn('bg-blue-500', selectedDayClassName),
          today && cn('bg-blue-100', todayClassName),
        )}
      >
        <Text
          className={cn(
            'font-medium',
            selected && cn('text-white', selectedDayTextClassName),
            today && cn('text-blue-600', todayTextClassName),
            !selected &&
              !today &&
              currentMonth &&
              cn('text-gray-900', dayTextClassName),
            !selected &&
              !today &&
              !currentMonth &&
              cn('text-gray-400', otherMonthDayTextClassName),
          )}
        >
          {date.getDate()}
        </Text>
      </View>
    </TouchableOpacity>
  ),
)

const CalendarDayHeader = memo(
  ({ day, dayHeaderClassName, dayHeaderTextClassName }: DayHeaderProps) => (
    <View
      className={cn('h-8 w-10 items-center justify-center', dayHeaderClassName)}
    >
      <Text
        className={cn(
          'text-xs font-medium text-gray-500',
          dayHeaderTextClassName,
        )}
      >
        {day}
      </Text>
    </View>
  ),
)

const CalendarHeader = memo(
  ({
    currentDate,
    onMonthYearClick,
    onNavigateMonth,
    headerClassName,
    monthYearTextClassName,
    navigationButtonClassName,
    navigationButtonTextClassName,
  }: CalendarHeaderProps) => {
    const formatMonth = useCallback((date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    }, [])

    return (
      <View
        className={cn(
          'flex-row items-center justify-between border-b border-gray-200 px-4 py-3',
          headerClassName,
        )}
      >
        <TouchableOpacity
          onPress={onMonthYearClick}
          className="flex-row items-center"
        >
          <Text
            className={cn(
              'mr-1 text-lg font-semibold text-gray-900',
              monthYearTextClassName,
            )}
          >
            {formatMonth(currentDate)}
          </Text>
          <Text className={cn('text-gray-500', monthYearTextClassName)}>›</Text>
        </TouchableOpacity>

        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={() => onNavigateMonth('prev')}
            className={cn(
              'h-8 w-8 items-center justify-center',
              navigationButtonClassName,
            )}
          >
            <Text
              className={cn(
                'text-lg font-medium text-blue-500',
                navigationButtonTextClassName,
              )}
            >
              ‹
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigateMonth('next')}
            className={cn(
              'h-8 w-8 items-center justify-center',
              navigationButtonClassName,
            )}
          >
            <Text
              className={cn(
                'text-lg font-medium text-blue-500',
                navigationButtonTextClassName,
              )}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  },
)

// Utility functions
const generateYears = (start: number, end: number): PickerData[] => {
  const years: PickerData[] = []
  for (let year = start; year <= end; year++) {
    years.push({ title: year.toString(), value: year })
  }
  return years
}

const generateMonths = (): PickerData[] => [
  { title: 'January', value: 0 },
  { title: 'February', value: 1 },
  { title: 'March', value: 2 },
  { title: 'April', value: 3 },
  { title: 'May', value: 4 },
  { title: 'June', value: 5 },
  { title: 'July', value: 6 },
  { title: 'August', value: 7 },
  { title: 'September', value: 8 },
  { title: 'October', value: 9 },
  { title: 'November', value: 10 },
  { title: 'December', value: 11 },
]
const generateDays = (year: number, month: number): PickerData[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: PickerData[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ title: day.toString(), value: day })
  }
  return days
}

// Animated wrapper component for calendar days
const AnimatedCalendarDay = memo(
  ({
    date,
    selected,
    today,
    currentMonth,
    onSelect,
    isEntering,
    direction,
    ...classNames
  }: CalendarDayProps & {
    isEntering: boolean
    direction: 'left' | 'right'
  }) => {
    const enteringAnimation = direction === 'left' ? SlideInLeft : SlideInRight
    const exitingAnimation = direction === 'left' ? SlideOutRight : SlideOutLeft

    return (
      <Animated.View
        entering={enteringAnimation.springify().damping(15)}
        exiting={exitingAnimation.springify().damping(15)}
      >
        <TouchableOpacity
          onPress={() => onSelect(date)}
          className={cn(
            'h-10 w-10 items-center justify-center',
            classNames.dayClassName,
          )}
        >
          <View
            className={cn(
              'h-8 w-8 items-center justify-center rounded-full',
              selected && cn('bg-blue-500', classNames.selectedDayClassName),
              today && cn('bg-blue-100', classNames.todayClassName),
            )}
          >
            <Text
              className={cn(
                'font-medium',
                selected &&
                  cn('text-white', classNames.selectedDayTextClassName),
                today && cn('text-blue-600', classNames.todayTextClassName),
                !selected &&
                  !today &&
                  currentMonth &&
                  cn('text-gray-900', classNames.dayTextClassName),
                !selected &&
                  !today &&
                  !currentMonth &&
                  cn('text-gray-400', classNames.otherMonthDayTextClassName),
              )}
            >
              {date.getDate()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  },
)

// Calendar Grid Component with unified animation
const CalendarGrid = memo(
  ({
    currentDate,
    selectedDate,
    onDateSelect,
    ...classNames
  }: CalendarGridProps) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const [transitionDirection, setTransitionDirection] = useState<
      'left' | 'right'
    >('right')
    const [prevMonth, setPrevMonth] = useState({ year, month })

    // Update transition direction when month changes
    useMemo(() => {
      const isForward =
        year > prevMonth.year ||
        (year === prevMonth.year && month > prevMonth.month)
      setTransitionDirection(isForward ? 'right' : 'left')
      setPrevMonth({ year, month })
    }, [year, month])

    const { calendarWeeks } = useMemo(() => {
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const weeks: Date[][] = []
      const current = new Date(startDate)

      for (let week = 0; week < 6; week++) {
        const weekDays: Date[] = []
        for (let day = 0; day < 7; day++) {
          weekDays.push(new Date(current))
          current.setDate(current.getDate() + 1)
        }
        weeks.push(weekDays)
      }
      return { calendarWeeks: weeks }
    }, [year, month])

    const isToday = useCallback((date: Date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }, [])

    const isSelected = useCallback(
      (date: Date) => date.toDateString() === selectedDate.toDateString(),
      [selectedDate],
    )

    const isCurrentMonth = useCallback(
      (date: Date) => date.getMonth() === month,
      [month],
    )

    return (
      <View className="px-4">
        {/* Day headers */}
        <View className="mb-2 grid grid-cols-7">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <CalendarDayHeader
              key={day}
              day={day}
              dayHeaderClassName={classNames.dayHeaderClassName}
              dayHeaderTextClassName={classNames.dayHeaderTextClassName}
            />
          ))}
        </View>

        {/* Calendar days with unified animation */}
        <View className="relative h-60 overflow-hidden">
          <Animated.View
            className="absolute inset-0 grid grid-cols-7"
            key={`${year}-${month}`}
            entering={(transitionDirection === 'right'
              ? SlideInRight
              : SlideInLeft
            )
              .springify()
              .damping(20)
              .stiffness(100)}
            exiting={(transitionDirection === 'right'
              ? SlideOutLeft
              : SlideOutRight
            )
              .springify()
              .damping(20)
              .stiffness(100)}
          >
            {calendarWeeks.map((week, weekIndex) =>
              week.map((date, dayIndex) => (
                <CalendarDay
                  key={`${weekIndex}-${dayIndex}`}
                  date={date}
                  selected={isSelected(date)}
                  today={isToday(date)}
                  currentMonth={isCurrentMonth(date)}
                  onSelect={onDateSelect}
                  {...classNames}
                />
              )),
            )}
          </Animated.View>
        </View>
      </View>
    )
  },
)

// Month/Year Picker Modal Component
const MonthYearPicker = memo(
  ({
    visible,
    currentDate,
    onClose,
    onDateChange,
    ...classNames
  }: MonthYearPickerProps) => {
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

    const years = useMemo(() => generateYears(1900, 2100), [])
    const months = useMemo(() => generateMonths(), [])

    const currentYearIndex = useMemo(
      () => years.findIndex((year) => year.value === selectedYear),
      [years, selectedYear],
    )

    const handleConfirm = useCallback(() => {
      const newDate = new Date(currentDate)
      newDate.setFullYear(selectedYear)
      newDate.setMonth(selectedMonth)
      onDateChange(newDate)
      onClose()
    }, [selectedYear, selectedMonth, currentDate, onDateChange, onClose])

    const handleYearChange = useCallback((data: PickerData) => {
      setSelectedYear(data.value)
    }, [])

    const handleMonthChange = useCallback((data: PickerData) => {
      setSelectedMonth(data.value)
    }, [])

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable
          className={cn(
            'flex-1 items-center justify-center bg-black/50',
            classNames.modalClassName,
          )}
          onPress={onClose}
        >
          <Pressable
            className={cn(
              'mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white',
              classNames.modalContentClassName,
            )}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View
              className={cn(
                'flex-row items-center justify-between border-b border-gray-200 p-4',
                classNames.modalHeaderClassName,
              )}
            >
              <TouchableOpacity
                onPress={onClose}
                className={classNames.modalButtonClassName}
              >
                <Text
                  className={cn(
                    'font-medium text-blue-500',
                    classNames.modalButtonTextClassName,
                  )}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                className={cn(
                  'font-semibold text-gray-900',
                  classNames.modalHeaderTextClassName,
                )}
              >
                Select Date
              </Text>
              <TouchableOpacity
                onPress={handleConfirm}
                className={classNames.modalButtonClassName}
              >
                <Text
                  className={cn(
                    'font-medium text-blue-500',
                    classNames.modalButtonTextClassName,
                  )}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pickers */}
            <View
              className={cn(
                'h-64 flex-row',
                classNames.pickerContainerClassName,
              )}
            >
              <View className="flex-1">
                <Picker
                  pickerData={months}
                  initialIndex={selectedMonth}
                  onSelected={handleMonthChange}
                  itemHeight={44}
                  visible={5}
                  textStyle={{ fontSize: 18 }}
                />
              </View>
              <View className="flex-1">
                <Picker
                  pickerData={years}
                  initialIndex={currentYearIndex}
                  onSelected={handleYearChange}
                  itemHeight={44}
                  visible={5}
                  textStyle={{ fontSize: 18 }}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    )
  },
)

// Main DatePicker Component
export const DatePicker = memo(
  ({
    initialDate = new Date(),
    onDateChange,
    minimumDate,
    maximumDate,
    ...classNames
  }: DatePickerProps) => {
    const [selectedDate, setSelectedDate] = useState(initialDate)
    const [currentViewDate, setCurrentViewDate] = useState(initialDate)
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false)

    const handleDateSelect = useCallback(
      (date: Date) => {
        setSelectedDate(date)
        onDateChange?.(date)
      },
      [onDateChange],
    )

    const handleMonthYearChange = useCallback((date: Date) => {
      setCurrentViewDate(date)
    }, [])

    const navigateMonth = useCallback((direction: 'prev' | 'next') => {
      setCurrentViewDate((prev) => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      })
    }, [])

    return (
      <View
        className={cn(
          'w-full max-w-md overflow-hidden rounded-2xl bg-white',
          classNames.className,
        )}
      >
        <StatusBar barStyle="dark-content" />

        <CalendarHeader
          currentDate={currentViewDate}
          onMonthYearClick={() => setShowMonthYearPicker(true)}
          onNavigateMonth={navigateMonth}
          headerClassName={classNames.headerClassName}
          monthYearTextClassName={classNames.monthYearTextClassName}
          navigationButtonClassName={classNames.navigationButtonClassName}
          navigationButtonTextClassName={
            classNames.navigationButtonTextClassName
          }
        />

        <CalendarGrid
          currentDate={currentViewDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          dayHeaderClassName={classNames.dayHeaderClassName}
          dayHeaderTextClassName={classNames.dayHeaderTextClassName}
          dayClassName={classNames.dayClassName}
          dayTextClassName={classNames.dayTextClassName}
          selectedDayClassName={classNames.selectedDayClassName}
          selectedDayTextClassName={classNames.selectedDayTextClassName}
          todayClassName={classNames.todayClassName}
          todayTextClassName={classNames.todayTextClassName}
          otherMonthDayClassName={classNames.otherMonthDayClassName}
          otherMonthDayTextClassName={classNames.otherMonthDayTextClassName}
        />

        <MonthYearPicker
          visible={showMonthYearPicker}
          currentDate={currentViewDate}
          onClose={() => setShowMonthYearPicker(false)}
          onDateChange={handleMonthYearChange}
          modalClassName={classNames.modalClassName}
          modalContentClassName={classNames.modalContentClassName}
          modalHeaderClassName={classNames.modalHeaderClassName}
          modalHeaderTextClassName={classNames.modalHeaderTextClassName}
          modalButtonClassName={classNames.modalButtonClassName}
          modalButtonTextClassName={classNames.modalButtonTextClassName}
          pickerContainerClassName={classNames.pickerContainerClassName}
        />
      </View>
    )
  },
)
