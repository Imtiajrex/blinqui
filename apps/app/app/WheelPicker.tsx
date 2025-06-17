import { useState } from 'react'
import { Text, View } from 'react-native'
import { Picker as WheelPicker } from 'blinqui/components/WheelPickerList'

const DATA = Array.from({ length: 100 }, (_, i) => ({
  title: `Item ${i + 1}`,
  value: i + 1,
}))

const WheelPickerScreen = () => {
  const [selected, setSelected] = useState(0)
  return (
    <View style={{ height: 200 }}>
      <View style={{ padding: 10 }}>
        <Text>Selected Item: {selected}</Text>
      </View>
      <WheelPicker
        selectedViewColor="#fefefe"
        pickerData={DATA}
        onSelected={(item) => {
          setSelected(item.value)
        }}
      />
    </View>
  )
}
export default WheelPickerScreen
