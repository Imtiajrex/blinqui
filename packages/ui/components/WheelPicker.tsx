import {
  View,
  ViewProps,
  StyleProp,
  TextStyle,
  ViewStyle,
  Platform,
} from 'react-native'
import React, { useEffect, useRef } from 'react'
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import { snapPoint } from 'react-native-redash'

export type PickerData = {
  title: string
  value: any
}

export type PickerProps = ViewProps & {
  itemHeight?: number
  pickerData: PickerData[]
  initialIndex?: number
  visible?: number
  textStyle?: StyleProp<TextStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  selectedViewColor?: string
  maskColors?: {
    top?: string
    selected?: string
    bottom?: string
  }
  onSelected: (data: PickerData, index: number) => void
}

const Picker = ({
  itemHeight = 40,
  pickerData,
  visible = 5,
  textStyle,
  contentContainerStyle,
  initialIndex = 0,
  selectedViewColor = '#ffffff',
  maskColors = {
    top: 'rgba(255, 255, 255, 0.9)',
    selected: 'transparent',
    bottom: 'rgba(255, 255, 255, 0.9)',
  },
  onSelected,
  className,
  ...props
}: PickerProps & { className?: string }) => {
  return (
    <View
      {...props}
      className={`flex-1 justify-center overflow-hidden ${className || ''}`}
    >
      <PickerItem
        itemHeight={itemHeight}
        pickerData={pickerData}
        visible={visible}
        textStyle={textStyle ?? {}}
        contentContainerStyle={contentContainerStyle}
        initialIndex={initialIndex}
        onSelected={onSelected}
        selectedViewColor={selectedViewColor}
        maskColors={maskColors}
      />
    </View>
  )
}
export default Picker
type PickerItemProps = Required<
  Pick<
    PickerProps,
    'itemHeight' | 'pickerData' | 'visible' | 'textStyle' | 'initialIndex'
  >
> &
  Pick<
    PickerProps,
    'onSelected' | 'contentContainerStyle' | 'selectedViewColor' | 'maskColors'
  >

const duration = 300

const PickerItem = ({
  itemHeight,
  pickerData,
  visible,
  textStyle,
  contentContainerStyle,
  initialIndex,
  selectedViewColor = '#ffffff',
  maskColors = {
    top: 'rgba(255, 255, 255, 0.9)',
    selected: 'transparent',
    bottom: 'rgba(255, 255, 255, 0.9)',
  },
  onSelected,
}: PickerItemProps) => {
  const translateY = useSharedValue(-itemHeight * initialIndex)
  const isGestureActive = useSharedValue(false)
  const gestureStartY = useSharedValue(0)
  const containerRef = useRef<any>(null)

  const snapPoints = new Array(pickerData.length)
    .fill(0)
    .map((_, i) => i * -itemHeight)

  const timingConfig = {
    duration: duration,
    easing: Easing.out(Easing.quad),
  }

  const wrapper = (index: number) => {
    if (onSelected && index >= 0 && index < pickerData.length) {
      onSelected(pickerData[index]!, index)
    }
  }

  const snapToClosest = (value: number, velocity: number = 0) => {
    'worklet'
    const snapPointY = snapPoint(value, velocity, snapPoints)
    const index = Math.abs(Math.round(snapPointY / itemHeight))
    translateY.value = withTiming(snapPointY, timingConfig)
    runOnJS(wrapper)(index)
  }

  // Enhanced wheel support for web
  useEffect(() => {
    if (Platform.OS === 'web' && containerRef.current) {
      let wheelTimeout: NodeJS.Timeout

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (isGestureActive.value) return

        const delta = event.deltaY
        const sensitivity = 1.2
        const newValue = translateY.value - delta * sensitivity

        // Smooth bounds checking
        const minValue = snapPoints[snapPoints.length - 1]
        const maxValue = snapPoints[0]
        const boundedValue = Math.max(minValue!, Math.min(maxValue!, newValue))

        translateY.value = boundedValue

        // Clear existing timeout and set new one
        clearTimeout(wheelTimeout)
        wheelTimeout = setTimeout(() => {
          snapToClosest(translateY.value, 0)
        }, 100)
      }

      const container = containerRef.current
      if (container && container.addEventListener) {
        container.addEventListener('wheel', handleWheel, {
          passive: false,
          capture: true,
        })

        return () => {
          clearTimeout(wheelTimeout)
          if (container.removeEventListener) {
            container.removeEventListener('wheel', handleWheel, true)
          }
        }
      }
    }
  }, [itemHeight, snapPoints, translateY, isGestureActive])

  // Fixed Pan Gesture for Native
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isGestureActive.value = true
      // Store the current position when gesture starts
      gestureStartY.value = translateY.value
    })
    .onUpdate((event) => {
      // Calculate from the gesture start position, not initial position
      const newValue = gestureStartY.value + event.translationY

      // Apply bounds with elasticity
      const minValue = snapPoints[snapPoints.length - 1] || 0
      const maxValue = snapPoints[0] || 0

      if (newValue > maxValue) {
        // Elastic effect at top
        const overflow = newValue - maxValue
        translateY.value = maxValue + overflow * 0.2
      } else if (newValue < minValue) {
        // Elastic effect at bottom
        const overflow = minValue - newValue
        translateY.value = minValue - overflow * 0.2
      } else {
        translateY.value = newValue
      }
    })
    .onEnd((event) => {
      isGestureActive.value = false
      snapToClosest(translateY.value, event.velocityY)
    })
    .onFinalize(() => {
      isGestureActive.value = false
    })
    // More permissive gesture recognition for native
    .minDistance(0)
    .activeOffsetY([-5, 5])
    .failOffsetX([-30, 30])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const halfVisible = Math.floor(visible / 2)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View ref={containerRef} style={{ position: 'relative', flex: 1 }}>
        {/* Gesture detector should wrap the scrollable content directly */}
        <GestureDetector gesture={panGesture}>
          <View
            style={{
              height: itemHeight * visible,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={[
                animatedStyle,
                contentContainerStyle,
                {
                  paddingTop: (itemHeight * visible) / 2 - itemHeight / 2,
                },
              ]}
            >
              {pickerData.map((item, index) => (
                <Item
                  key={index}
                  translateY={translateY}
                  index={index}
                  itemHeight={itemHeight}
                  visible={visible}
                  data={item}
                  textStyle={textStyle}
                />
              ))}
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Overlay masks - positioned absolutely to not interfere with gestures */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: itemHeight * halfVisible,
            backgroundColor: maskColors.top,
          }}
        />

        {/* Selection indicator */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: itemHeight,
            top: itemHeight * halfVisible,
            backgroundColor: maskColors.selected,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.15)',
          }}
        />

        {/* Bottom fade overlay */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: itemHeight * halfVisible,
            backgroundColor: maskColors.bottom,
          }}
        />
      </View>
    </GestureHandlerRootView>
  )
}

type ItemProps = {
  translateY: Animated.SharedValue<number>
  index: number
  data: PickerData
} & Required<Pick<PickerProps, 'itemHeight' | 'visible'>> &
  Pick<PickerProps, 'textStyle'>

const Item = ({
  translateY,
  index,
  itemHeight,
  visible,
  data,
  textStyle,
}: ItemProps) => {
  const y = useDerivedValue(() =>
    interpolate(
      translateY.value / -itemHeight,
      [index - visible / 2, index, index + visible / 2],
      [-1, 0, 1],
      'clamp',
    ),
  )

  const animatedItemStyle = useAnimatedStyle(() => {
    const absY = Math.abs(y.value)
    const opacity = interpolate(absY, [0, 0.5, 1], [1, 0.6, 0.3], 'clamp')
    const scale = interpolate(absY, [0, 1], [1, 0.85], 'clamp')

    // Platform-specific 3D transform
    const rotateX =
      interpolate(absY, [0, 1], [0, 25], 'clamp') * (y.value > 0 ? 1 : -1)

    return {
      opacity,
      transform: [
        { scale },
        ...(Platform.OS !== 'web'
          ? [{ perspective: 1000 }, { rotateX: `${rotateX}deg` }]
          : [{ perspective: 1000 }, { rotateX: `${rotateX}deg` }]),
      ],
    }
  })

  return (
    <View
      style={{
        height: itemHeight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.Text
        style={[
          animatedItemStyle,
          textStyle,
          {
            fontSize: 16,
            lineHeight: itemHeight * 0.6,
            textAlign: 'center',
            fontWeight: '500',
            color: '#374151',
            ...(Platform.OS === 'web' && { userSelect: 'none' }),
          },
        ]}
      >
        {data.title}
      </Animated.Text>
    </View>
  )
}
