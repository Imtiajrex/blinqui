import { memo, useCallback, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { Picker, PickerData } from './WheelPicker' // Import your picker component

const generateHours = (use24Hour: boolean): PickerData[] => {
  const hours: PickerData[] = []
  const maxHour = use24Hour ? 23 : 12
  const startHour = use24Hour ? 0 : 1

  for (let hour = startHour; hour <= maxHour; hour++) {
    hours.push({
      title: hour.toString().padStart(2, '0'),
      value: hour,
    })
  }
  return hours
}

const generateMinutes = (): PickerData[] => {
  const minutes: PickerData[] = []
  for (let minute = 0; minute < 60; minute++) {
    minutes.push({
      title: minute.toString().padStart(2, '0'),
      value: minute,
    })
  }
  return minutes
}

interface TimePickerProps {
  initialTime?: { hour: number; minute: number; period: 'AM' | 'PM' }
  onTimeChange?: (time: {
    hour: number
    minute: number
    period: 'AM' | 'PM'
  }) => void
  use24Hour?: boolean
}
// Time Picker Component
export const TimePicker = memo(
  ({
    initialTime = { hour: 3, minute: 16, period: 'AM' },
    onTimeChange,
    use24Hour = false,
  }: TimePickerProps) => {
    const [time, setTime] = useState(initialTime)

    const hours = useMemo(() => generateHours(use24Hour), [use24Hour])
    const minutes = useMemo(() => generateMinutes(), [])
    const periods = useMemo(
      () => [
        { title: 'AM', value: 'AM' },
        { title: 'PM', value: 'PM' },
      ],
      [],
    )

    const handleHourChange = useCallback(
      (data: PickerData) => {
        const newTime = { ...time, hour: data.value }
        setTime(newTime)
        onTimeChange?.(newTime)
      },
      [time, onTimeChange],
    )

    const handleMinuteChange = useCallback(
      (data: PickerData) => {
        const newTime = { ...time, minute: data.value }
        setTime(newTime)
        onTimeChange?.(newTime)
      },
      [time, onTimeChange],
    )

    const handlePeriodChange = useCallback(
      (data: PickerData) => {
        const newTime = { ...time, period: data.value }
        setTime(newTime)
        onTimeChange?.(newTime)
      },
      [time, onTimeChange],
    )

    const hourIndex = useMemo(
      () => hours.findIndex((h) => h.value === time.hour),
      [hours, time.hour],
    )

    const minuteIndex = useMemo(() => time.minute, [time.minute])
    const periodIndex = useMemo(
      () => (time.period === 'AM' ? 0 : 1),
      [time.period],
    )

    return (
      <View className="h-32 flex-row">
        <View className="flex-1">
          <Picker
            pickerData={hours}
            initialIndex={hourIndex}
            onSelected={handleHourChange}
            itemHeight={32}
            visible={3}
            textStyle={{ fontSize: 20, fontWeight: '600' }}
          />
        </View>
        <View className="w-4 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-800">:</Text>
        </View>
        <View className="flex-1">
          <Picker
            pickerData={minutes}
            initialIndex={minuteIndex}
            onSelected={handleMinuteChange}
            itemHeight={32}
            visible={3}
            textStyle={{ fontSize: 20, fontWeight: '600' }}
          />
        </View>
        {!use24Hour && (
          <View className="w-16">
            <Picker
              pickerData={periods}
              initialIndex={periodIndex}
              onSelected={handlePeriodChange}
              itemHeight={32}
              visible={3}
              textStyle={{ fontSize: 16, fontWeight: '500' }}
            />
          </View>
        )}
      </View>
    )
  },
)
