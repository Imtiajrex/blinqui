import { useState } from 'react'
import { View } from 'react-native'
import { Picker as WheelPicker } from 'blinqui/components/WheelPickerList'

// ...
const DATA = [
  { title: '2022', value: 1 },
  { title: '2023', value: 2 },
  { title: '2024', value: 3 },
  { title: '2025', value: 4 },
  { title: '2026', value: 5 },
  { title: '2027', value: 6 },
  { title: '2028', value: 7 },
  { title: '2029', value: 8 },
  { title: '2030', value: 9 },
  { title: '2031', value: 10 },
  { title: '2032', value: 11 },
  { title: '2033', value: 12 },
  { title: '2034', value: 13 },
  { title: '2035', value: 14 },
  { title: '2036', value: 15 },
  { title: '2037', value: 16 },
  { title: '2038', value: 17 },
  { title: '2039', value: 18 },
  { title: '2040', value: 19 },
  { title: '2041', value: 20 },
  { title: '2042', value: 21 },
  { title: '2043', value: 22 },
  { title: '2044', value: 23 },
]

const WheelPickerScreen = () => {
  return (
    <View style={{ height: 200 }}>
      <WheelPicker
        pickerData={DATA}
        textStyle={{ fontSize: 27 }}
        onSelected={(item) => {}}
      />
    </View>
  )
}
export default WheelPickerScreen
