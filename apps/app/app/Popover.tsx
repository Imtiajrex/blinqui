// Usage Examples
import React, { useCallback, useRef, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import {
  Popover,
  PopoverRef,
  PopoverPlacement,
} from 'blinqui/components/Popover'

const PopoverExample = () => {
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef<PopoverRef>(null)

  const handleVisibilityChange = useCallback((visible: boolean) => {
    setShowPopover(visible)
    console.log('Popover visibility:', visible)
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-8">
      {/* Example 1: Basic Popover */}
      <Popover
        content={
          <View className="min-w-48">
            <Text className="mb-2 text-lg font-semibold text-gray-900">
              Popover Title
            </Text>
            <Text className="mb-4 text-gray-600">
              This is a beautiful popover with smooth animations and proper
              positioning.
            </Text>
            <TouchableOpacity className="rounded-lg bg-blue-500 px-4 py-2">
              <Text className="text-center font-medium text-white">Action</Text>
            </TouchableOpacity>
          </View>
        }
        placement="bottom"
        onVisibilityChange={handleVisibilityChange}
      >
        <TouchableOpacity className="mb-4 rounded-lg bg-blue-500 px-6 py-3">
          <Text className="font-semibold text-white">Show Popover</Text>
        </TouchableOpacity>
      </Popover>

      {/* Example 2: Controlled Popover with Ref */}
      <Popover
        ref={popoverRef}
        content={
          <View className="w-56">
            <Text className="mb-2 font-semibold text-gray-900">
              Menu Options
            </Text>
            <TouchableOpacity className="border-b border-gray-200 px-1 py-2">
              <Text className="text-gray-700">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className="border-b border-gray-200 px-1 py-2">
              <Text className="text-gray-700">Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-1 py-2">
              <Text className="text-red-600">Sign Out</Text>
            </TouchableOpacity>
          </View>
        }
        placement="top-end"
        arrow={true}
      >
        <TouchableOpacity className="mb-4 rounded-lg bg-gray-600 px-6 py-3">
          <Text className="font-semibold text-white">Menu Popover</Text>
        </TouchableOpacity>
      </Popover>

      {/* Example 3: Different Placements */}
      <View className="flex-row flex-wrap justify-center gap-4">
        {(['top', 'bottom', 'left', 'right'] as PopoverPlacement[]).map(
          (placement) => (
            <Popover
              key={placement}
              content={
                <Text className="font-medium text-gray-800">
                  {placement.charAt(0).toUpperCase() + placement.slice(1)}{' '}
                  Popover
                </Text>
              }
              placement={placement}
            >
              <TouchableOpacity className="m-1 rounded-lg bg-green-500 px-4 py-2">
                <Text className="text-sm font-medium text-white">
                  {placement.charAt(0).toUpperCase() + placement.slice(1)}
                </Text>
              </TouchableOpacity>
            </Popover>
          ),
        )}
      </View>
    </View>
  )
}

export default PopoverExample
