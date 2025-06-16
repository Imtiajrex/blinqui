import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { DatePicker } from 'blinqui/components/Calendar'
// Usage Example
const DatePickerExample = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date)
    console.log('Selected date:', date)
  }, [])

  return (
    <View className="flex-1 justify-center bg-gray-100 p-4">
      <DatePicker initialDate={selectedDate} onDateChange={handleDateChange} />
    </View>
  )
}

export default DatePickerExample
