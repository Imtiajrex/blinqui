import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { StatusBar, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  FadeIn,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import {
  CalendarProvider,
  useCalendarContext,
} from '../contexts/CalendarContext'
import { cn } from '../lib/utils'
import { Picker, PickerData } from './WheelPicker'
import { Ionicons } from '@expo/vector-icons'

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
  onMonthYearClick: () => void
  showMonthYearPicker?: boolean
}

interface CalendarGridProps extends DayClassNames {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface MonthYearPickerProps extends ModalClassNames {
  onMonthYearChange: (date: Date) => void
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
      className={cn(
        'min-h-[40px] flex-1 items-center justify-center',
        dayClassName,
      )}
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
            'text-base font-medium',
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
      className={cn(
        'min-h-[32px] flex-1 items-center justify-center',
        dayHeaderClassName,
      )}
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
    onMonthYearClick,
    headerClassName,
    monthYearTextClassName,
    navigationButtonClassName,
    navigationButtonTextClassName,
    showMonthYearPicker = false,
  }: CalendarHeaderProps) => {
    const currentDate = useCalendarContext((state) => state.currentDate)
    const navigateMonthStore = useCalendarContext(
      (state) => state.navigateMonth,
    )

    const navigateMonth = useCallback(
      (direction: 'prev' | 'next') => {
        navigateMonthStore(direction)
      },
      [navigateMonthStore],
    )
    const formatMonth = useCallback((date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    }, [])
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            rotate: showMonthYearPicker
              ? withSpring('90deg', {
                  damping: 3,
                  stiffness: 100,
                  mass: 0.3,
                })
              : withSpring('0deg', {
                  damping: 3,
                  stiffness: 100,
                  mass: 0.3,
                }),
          },
        ],
      }
    })

    return (
      <Animated.View
        className={cn(
          'flex-row items-center justify-between border-b border-gray-200 px-4 py-3',
          headerClassName,
        )}
        entering={FadeIn.duration(200)}
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
          <Animated.View style={animatedStyle}>
            <Ionicons name="chevron-forward" size={24} color="blue" />
          </Animated.View>
        </TouchableOpacity>

        {!showMonthYearPicker && (
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
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
              onPress={() => navigateMonth('next')}
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
        )}
      </Animated.View>
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

// Month/Year Picker Component
const MonthYearPicker = ({
  onMonthYearChange,
  ...classNames
}: MonthYearPickerProps) => {
  const currentDate = useCalendarContext((state) => state.currentDate)
  const selectedYear = currentDate.getFullYear()
  const selectedMonth = currentDate.getMonth()

  const years = useMemo(() => generateYears(1900, 2100), [])
  const months = useMemo(() => generateMonths(), [])

  const currentYearIndex = useMemo(
    () => years.findIndex((year) => year.value === selectedYear),
    [years, selectedYear],
  )

  const currentMonthIndex = useMemo(
    () => months.findIndex((month) => month.value === selectedMonth),
    [months, selectedMonth],
  )

  const handleMonthChange = useCallback(
    (data: PickerData) => {
      const newDate = new Date(currentDate)
      newDate.setFullYear(selectedYear)
      newDate.setMonth(data.value)
      onMonthYearChange(newDate)
    },
    [selectedYear, currentDate, onMonthYearChange],
  )

  const handleYearChange = useCallback(
    (data: PickerData) => {
      const newDate = new Date(currentDate)
      newDate.setFullYear(data.value)
      newDate.setMonth(selectedMonth)
      onMonthYearChange(newDate)
    },
    [selectedMonth, currentDate, onMonthYearChange],
  )

  return (
    <Animated.View
      className={cn('overflow-hidden', classNames.className)}
      entering={FadeIn}
      layout={LinearTransition}
    >
      <View
        className={cn('w-full flex-row', classNames.pickerContainerClassName)}
      >
        <View className="flex-1">
          <Picker
            pickerData={months}
            initialIndex={currentMonthIndex}
            onSelected={handleMonthChange}
          />
        </View>
        <View className="flex-1">
          <Picker
            pickerData={years}
            initialIndex={currentYearIndex}
            onSelected={handleYearChange}
          />
        </View>
      </View>
    </Animated.View>
  )
}

// Calendar Grid Component
const CalendarGrid = memo(
  ({
    selectedDate,
    onDateSelect,
    isInitialRender = false,
    ...classNames
  }: CalendarGridProps & { isInitialRender?: boolean }) => {
    const currentDate = useCalendarContext((state) => state.currentDate)
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
    const renderDays = useMemo(() => {
      return (
        <View>
          {calendarWeeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row">
              {week.map((date, dayIndex) => (
                <CalendarDay
                  key={`${weekIndex}-${dayIndex}`}
                  date={date}
                  selected={isSelected(date)}
                  today={isToday(date)}
                  currentMonth={isCurrentMonth(date)}
                  onSelect={onDateSelect}
                  {...classNames}
                />
              ))}
            </View>
          ))}
        </View>
      )
    }, [
      calendarWeeks,
      isSelected,
      isToday,
      isCurrentMonth,
      onDateSelect,
      classNames,
    ])

    return (
      <View className="px-4">
        {/* Day headers */}
        <View className="mb-2 flex-row">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <CalendarDayHeader
              key={day}
              day={day}
              dayHeaderClassName={classNames.dayHeaderClassName}
              dayHeaderTextClassName={classNames.dayHeaderTextClassName}
            />
          ))}
        </View>

        <View className="h-[280px] w-full overflow-hidden">
          <Animated.View
            key={`${year}-${month}`}
            className="absolute top-0 w-full"
            layout={undefined}
            entering={
              !isInitialRender
                ? transitionDirection === 'right'
                  ? SlideInRight.duration(300).withInitialValues({
                      transform: [{ translateX: 400 }, { translateY: 0 }],
                    })
                  : SlideInLeft.duration(300).withInitialValues({
                      transform: [{ translateX: -400 }, { translateY: 0 }],
                    })
                : undefined
            }
            exiting={
              transitionDirection === 'right'
                ? SlideOutLeft.duration(300).withInitialValues({
                    transform: [{ translateX: 0 }, { translateY: 0 }],
                  })
                : SlideOutRight.duration(300).withInitialValues({
                    transform: [{ translateX: 0 }, { translateY: 0 }],
                  })
            }
          >
            {renderDays}
          </Animated.View>
        </View>
      </View>
    )
  },
)

// Main DatePicker Component
const CalendarContent = memo(
  ({
    initialDate = new Date(),
    onDateChange,
    minimumDate,
    maximumDate,
    ...classNames
  }: DatePickerProps) => {
    const [selectedDate, setSelectedDate] = useState(initialDate)
    const setCurrentDate = useCalendarContext((state) => state.setCurrentDate)
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false)
    const [isInitialRender, setIsInitialRender] = useState(true)

    // Initialize the store's currentDate with initialDate
    useEffect(() => {
      setCurrentDate(initialDate)
    }, [initialDate, setCurrentDate])

    const handleDateSelect = useCallback(
      (date: Date) => {
        setSelectedDate(date)
        onDateChange?.(date)
      },
      [onDateChange],
    )

    const handleMonthYearChange = useCallback(
      (date: Date) => {
        setCurrentDate(date)
      },
      [setCurrentDate],
    )
    useEffect(() => {
      setIsInitialRender(false)
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
          onMonthYearClick={() => {
            setIsInitialRender(false)
            setShowMonthYearPicker((prev) => !prev)
          }}
          showMonthYearPicker={showMonthYearPicker}
          {...classNames}
        />

        {!showMonthYearPicker ? (
          <CalendarGrid
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            isInitialRender={isInitialRender}
            {...classNames}
          />
        ) : (
          <MonthYearPicker
            onMonthYearChange={handleMonthYearChange}
            {...classNames}
          />
        )}
      </View>
    )
  },
)

export const DatePicker = memo((props: DatePickerProps) => {
  return (
    <CalendarProvider>
      <CalendarContent {...props} />
    </CalendarProvider>
  )
})
