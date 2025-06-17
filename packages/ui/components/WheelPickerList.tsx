import { AnimatedLegendList } from '@legendapp/list/reanimated'
import { useCallback, useEffect, useRef } from 'react'
import {
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
  Platform,
} from 'react-native'
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'

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

const duration = 300

export const Picker = ({
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
  const listRef = useRef<any>(null)
  const translateY = useSharedValue(-itemHeight * initialIndex)
  const currentIndex = useSharedValue(initialIndex)
  const scale = useSharedValue(0.95)
  const scrollY = useSharedValue(0)
  const isDragging = useSharedValue(false)
  const startY = useSharedValue(0)

  const timingConfig = {
    duration: duration,
    easing: Easing.out(Easing.quad),
  }

  useEffect(() => {
    scale.value = withSpring(1)
  }, [])

  const updateIndex = useCallback(
    (index: number) => {
      'worklet'
      if (index >= 0 && index < pickerData.length) {
        currentIndex.value = index
        runOnJS(onSelected)(pickerData[index]!, index)
      }
    },
    [pickerData, onSelected],
  )

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
      const index = Math.round(scrollY.value / itemHeight)
      if (index !== currentIndex.value) {
        updateIndex(index)
      }
    },
  })

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true
      startY.value = scrollY.value
    })
    .onUpdate((event) => {
      if (Platform.OS === 'web') {
        const newScrollY = startY.value - event.translationY
        const maxScroll = (pickerData.length - visible) * itemHeight
        const boundedScrollY = Math.max(0, Math.min(newScrollY, maxScroll))

        if (listRef.current) {
          listRef.current.scrollToOffset({
            offset: boundedScrollY,
            animated: false,
          })
        }
      }
    })
    .onEnd((event) => {
      if (Platform.OS === 'web') {
        isDragging.value = false
        const velocity = -event.velocityY
        const currentOffset = scrollY.value
        const targetOffset = Math.round(currentOffset / itemHeight) * itemHeight

        if (listRef.current) {
          listRef.current.scrollToOffset({
            offset: targetOffset,
            animated: true,
          })
        }
      }
    })

  const renderItem = useCallback(
    ({ item, index }: { item: PickerData; index: number }) => {
      const itemStyle = useAnimatedStyle(() => {
        const centerOffset = scrollY.value + (visible * itemHeight) / 2
        const itemPosition = index * itemHeight
        const distanceFromCenter =
          Math.abs(centerOffset - itemPosition) / itemHeight

        const opacity = interpolate(
          distanceFromCenter,
          [0, visible / 2],
          [1, 0.5],
          'clamp',
        )

        const scale = interpolate(
          distanceFromCenter,
          [0, visible / 2],
          [1.1, 0.7],
          'clamp',
        )

        const currentIdx = Math.round(scrollY.value / itemHeight)

        return {
          opacity,
          height: itemHeight,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            index === currentIdx ? selectedViewColor : 'transparent',
          transform: [{ scale }],
        }
      })

      return (
        <Animated.View style={itemStyle}>
          <Text style={[textStyle]}>{item.title}</Text>
        </Animated.View>
      )
    },
    [itemHeight, selectedViewColor, textStyle, visible, scrollY],
  )

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View
      {...props}
      className={`justify-center overflow-hidden ${className || ''}`}
    >
      <GestureHandlerRootView style={{ height: itemHeight * visible }}>
        <GestureDetector gesture={panGesture}>
          <View style={{ height: itemHeight * visible }}>
            <AnimatedLegendList
              ref={listRef}
              data={pickerData}
              renderItem={renderItem}
              initialScrollIndex={initialIndex}
              style={[{ flex: 1 }, contentContainerStyle, listStyle]}
              showsVerticalScrollIndicator={false}
              snapToInterval={itemHeight}
              decelerationRate="fast"
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>

      <View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: itemHeight * Math.floor(visible / 2),
            backgroundColor: maskColors.top,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: itemHeight * Math.floor(visible / 2),
            backgroundColor: maskColors.bottom,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  )
}

export default Picker
