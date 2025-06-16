import { Button, Text, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

export default function index() {
  return (
    <View>
      <Text>index</Text>
      <Button
        title="WheelPicker"
        onPress={() => {
          router.push('/WheelPicker')
        }}
      />
      <Button
        title="Calendar"
        onPress={() => {
          router.push('/DatePicker')
        }}
      />
      <Button
        title="Popover"
        onPress={() => {
          router.push('/Popover')
        }}
      />
    </View>
  )
}
