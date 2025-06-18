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
  FlatList,
} from 'react-native'
import Animated, {
  createAnimatedPropAdapter,
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedRef,
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
import { LegendListRef } from '@legendapp/list'

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

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
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
  const listRef = useAnimatedRef<Animated.FlatList<any>>()
  const initialOffset = initialIndex * itemHeight
  const currentIndex = useSharedValue(initialIndex)
  const scrollY = useSharedValue(initialOffset)
  const isDragging = useSharedValue(false)
  const startY = useSharedValue(0)

  const totalVisible = 2 * visible + 1
  useEffect(() => {
    if (Platform.OS === 'web')
      if (listRef.current)
        listRef.current?.scrollToOffset({
          offset: initialIndex * itemHeight,
          animated: true,
        })
    // This is a workaround for the initial scroll position not being set correctly
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
      if (Platform.OS === 'web') {
        // For web, we need to handle the scroll position manually
        const index = Math.round(event.contentOffset.y / itemHeight)
        if (index !== currentIndex.value) {
          updateIndex(index)
        }
      }
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.y / itemHeight)
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

  return (
    <View
      {...props}
      className={`justify-center overflow-hidden ${className || ''}`}
    >
      <GestureHandlerRootView
        style={{
          height: itemHeight * totalVisible,
        }}
      >
        <GestureDetector gesture={panGesture}>
          <View style={{ height: itemHeight * totalVisible }}>
            <Animated.FlatList
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
              getItemLayout={(data, index) => ({
                length: itemHeight,
                offset: index * itemHeight,
                index,
              })}
              keyExtractor={(item, index) =>
                item.value?.toString() || index.toString()
              }
              style={[{ flex: 1 }]}
              contentContainerStyle={{
                paddingTop: itemHeight * visible,
                paddingBottom: itemHeight * visible,
              }}
              showsVerticalScrollIndicator={false}
              snapToInterval={itemHeight}
              decelerationRate={Platform.OS === 'web' ? 'normal' : 'fast'}
              onScroll={scrollHandler}
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
  const animatedTextStyle = useAnimatedStyle(() => {
    const centerOffset =
      scrollY.value + (totalVisible * itemHeight) / 2 - itemHeight / 2
    const itemPosition = (index + 2) * itemHeight
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

    return {
      opacity,
      // backgroundColor: index === currentIdx ? selectedViewColor : 'transparent',
      transform: [{ scale }],
    }
  })
  return (
    <Animated.View
      style={{
        height: itemHeight,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.Text style={[animatedTextStyle, textStyle]}>
        {item.title}
      </Animated.Text>
    </Animated.View>
  )
}
export default Picker
