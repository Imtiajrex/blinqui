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
import Animated,
{
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
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
  visible = 2, // now represents items visible on each side
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
  const currentIndex = useSharedValue(initialIndex)
  const scale = useSharedValue(0.95)
  const scrollY = useSharedValue(0)
  const isDragging = useSharedValue(false)
  const startY = useSharedValue(0)

  // Total visible items is 2 * visible + 1 (items on top + selected item + items on bottom)
  const totalVisible = 2 * visible + 1

  useEffect(() => {
    scale.value = withSpring(1)
  }, [])

  const updateIndex = useCallback(
    (index: number) => {
      'worklet'
      if (index >= 0 && index < pickerData.length) {
        currentIndex.value = index + visible
        runOnJS(onSelected)(pickerData[index + visible]!, index)
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
    onMomentumEnd: () => {
      // Ensure we snap to the nearest item when momentum scrolling ends
      const targetOffset = Math.round(scrollY.value / itemHeight) * itemHeight
      if (listRef.current && Math.abs(scrollY.value - targetOffset) > 1) {
        listRef.current.scrollToOffset({
          offset: targetOffset,
          animated: true,
        })
      }
    },
  })

  // Handle wheel events for web
  useEffect(() => {
    if (Platform.OS === 'web' && listRef.current?._listRef?.current) {
      const element = listRef.current._listRef.current

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault()

        const newScrollY = scrollY.value + e.deltaY
        const maxScroll = (pickerData.length - 1) * itemHeight
        const boundedScrollY = Math.max(0, Math.min(newScrollY, maxScroll))

        // Clear any existing timeout
        if ((element as any)._snapTimeout) {
          clearTimeout((element as any)._snapTimeout)
        }

        // Scroll immediately to follow the wheel
        listRef.current.scrollToOffset({
          offset: boundedScrollY,
          animated: false,
        })

        // Set a timeout to snap after scrolling stops
        (element as any)._snapTimeout = setTimeout(() => {
          const targetOffset = Math.round(boundedScrollY / itemHeight) * itemHeight
          listRef.current.scrollToOffset({
            offset: targetOffset,
            animated: true,
          })
        }, 150) // Adjust this delay as needed
      }

      element.addEventListener('wheel', handleWheel, { passive: false })
      return () => element.removeEventListener('wheel', handleWheel)
    }
  }, [itemHeight, pickerData.length])

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true
      startY.value = scrollY.value
    })
    .onUpdate((event) => {
      if (Platform.OS === 'web') {
        const newScrollY = startY.value - event.translationY
        const maxScroll = (pickerData.length - 1) * itemHeight
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
        
        // Calculate the target offset based on velocity
        let targetOffset
        if (Math.abs(velocity) > 1000) {
          // If scrolling fast, move one additional item in the direction of velocity
          const direction = Math.sign(velocity)
          const baseIndex = Math.round(currentOffset / itemHeight)
          targetOffset = (baseIndex + direction) * itemHeight
        } else {
          // If scrolling slowly, just snap to nearest item
          targetOffset = Math.round(currentOffset / itemHeight) * itemHeight
        }
        
        // Ensure target is within bounds
        const maxScroll = (pickerData.length - 1) * itemHeight
        targetOffset = Math.max(0, Math.min(targetOffset, maxScroll))

        if (listRef.current) {
          listRef.current.scrollToOffset({
            offset: targetOffset,
            animated: true,
          })
        }
      }
    })

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View
      {...props}
      className={`justify-center overflow-hidden ${className || ''}`}
    >
      <GestureHandlerRootView style={{ height: itemHeight * totalVisible }}>
        <GestureDetector gesture={panGesture}>
          <View style={{ height: itemHeight * totalVisible }}>
            <AnimatedLegendList
              ref={listRef}
              data={pickerData}
              renderItem={({ item, index }) => (
                <Item
                  item={item}
                  index={index}
                  itemHeight={itemHeight}
                  scrollY={scrollY}
                  selectedViewColor={selectedViewColor}
                  textStyle={textStyle}
                  totalVisible={totalVisible}
                  visible={visible}
                />
              )}
              initialScrollIndex={initialIndex}
              style={[{ flex: 1 }, contentContainerStyle, listStyle]}
              showsVerticalScrollIndicator={false}
              snapToInterval={itemHeight}
              decelerationRate={Platform.OS === 'web' ? 'normal' : 'fast'}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              snapToOffsets={Array.from({ length: pickerData.length }, (_, i) => i * itemHeight)}
              disableIntervalMomentum={true}
              pagingEnabled={false}
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
            height: itemHeight * Math.floor(visible),
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
            height: itemHeight * Math.floor(visible),
            backgroundColor: maskColors.bottom,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  )
}

const Item = ({
  item,
  index,
  itemHeight,
  scrollY,
  selectedViewColor,
  textStyle,
  totalVisible,
  visible,
}: {
  item: PickerData
  index: number
  textStyle?: StyleProp<TextStyle>
  itemHeight: number
  scrollY: SharedValue<number>
  totalVisible: number
  visible: number
  selectedViewColor?: string
}) => {
  const itemStyle = useAnimatedStyle(() => {
    const centerOffset =
      scrollY.value + (totalVisible * itemHeight) / 2 - itemHeight / 2
    const itemPosition = index * itemHeight
    const distanceFromCenter =
      Math.abs(centerOffset - itemPosition) / itemHeight

    const opacity = interpolate(
      distanceFromCenter,
      [0, visible],
      [1, 0.5],
      'clamp',
    )

    const scale = interpolate(
      distanceFromCenter,
      [0, visible],
      [1.1, 0.7],
      'clamp',
    )

    const currentIdx = Math.round(scrollY.value / itemHeight)

    return {
      opacity,
      height: itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor: index === currentIdx ? selectedViewColor : 'transparent',
      transform: [{ scale }],
    }
  })

  return (
    <Animated.View style={itemStyle}>
      <Text style={[textStyle]}>{item.title}</Text>
    </Animated.View>
  )
}
export default Picker
