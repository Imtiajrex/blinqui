import React, {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  View,
  ViewStyle,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SpringConfig } from 'react-native-reanimated/lib/typescript/reanimated2/animation/springUtils'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Types
export interface PopoverPosition {
  x: number
  y: number
  width: number
  height: number
}

export type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end'

export interface PopoverProps {
  children: ReactNode
  content: ReactNode
  placement?: PopoverPlacement
  offset?: number
  isVisible?: boolean
  onVisibilityChange?: (visible: boolean) => void
  triggerStyle?: ViewStyle
  contentStyle?: ViewStyle
  overlayStyle?: ViewStyle
  animationConfig?: {
    tension?: number
    friction?: number
    duration?: number
  }
  closeOnOutsidePress?: boolean
  closeOnBackdropPress?: boolean
  arrow?: boolean
  arrowSize?: number
  disabled?: boolean
}

export interface PopoverRef {
  show: () => void
  hide: () => void
  toggle: () => void
  isVisible: boolean
}

// Animation configurations
const defaultSpringConfig = {
  tension: 300,
  friction: 20,
}

const defaultTimingConfig = {
  duration: 100,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
}

// Utility functions
const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    return 44 // Safe area for iOS
  }
  return StatusBar.currentHeight || 0
}

const calculatePopoverPosition = (
  triggerPosition: PopoverPosition,
  contentSize: { width: number; height: number },
  placement: PopoverPlacement,
  offset: number = 8,
  arrowSize: number = 8,
): { x: number; y: number; actualPlacement: PopoverPlacement } => {
  const statusBarHeight = getStatusBarHeight()
  const safeScreenHeight = screenHeight - statusBarHeight

  let x = 0
  let y = 0
  let actualPlacement = placement

  // Calculate base positions
  switch (placement) {
    case 'top':
      x = triggerPosition.x + triggerPosition.width / 2 - contentSize.width / 2
      y = triggerPosition.y - contentSize.height - offset - arrowSize
      break
    case 'top-start':
      x = triggerPosition.x
      y = triggerPosition.y - contentSize.height - offset - arrowSize
      break
    case 'top-end':
      x = triggerPosition.x + triggerPosition.width - contentSize.width
      y = triggerPosition.y - contentSize.height - offset - arrowSize
      break
    case 'bottom':
      x = triggerPosition.x + triggerPosition.width / 2 - contentSize.width / 2
      y = triggerPosition.y + triggerPosition.height + offset + arrowSize
      break
    case 'bottom-start':
      x = triggerPosition.x
      y = triggerPosition.y + triggerPosition.height + offset + arrowSize
      break
    case 'bottom-end':
      x = triggerPosition.x + triggerPosition.width - contentSize.width
      y = triggerPosition.y + triggerPosition.height + offset + arrowSize
      break
    case 'left':
      x = triggerPosition.x - contentSize.width - offset - arrowSize
      y =
        triggerPosition.y + triggerPosition.height / 2 - contentSize.height / 2
      break
    case 'left-start':
      x = triggerPosition.x - contentSize.width - offset - arrowSize
      y = triggerPosition.y
      break
    case 'left-end':
      x = triggerPosition.x - contentSize.width - offset - arrowSize
      y = triggerPosition.y + triggerPosition.height - contentSize.height
      break
    case 'right':
      x = triggerPosition.x + triggerPosition.width + offset + arrowSize
      y =
        triggerPosition.y + triggerPosition.height / 2 - contentSize.height / 2
      break
    case 'right-start':
      x = triggerPosition.x + triggerPosition.width + offset + arrowSize
      y = triggerPosition.y
      break
    case 'right-end':
      x = triggerPosition.x + triggerPosition.width + offset + arrowSize
      y = triggerPosition.y + triggerPosition.height - contentSize.height
      break
  }

  // Boundary checks and adjustments
  const padding = 16

  // Horizontal boundary checks
  if (x < padding) {
    x = padding
  } else if (x + contentSize.width > screenWidth - padding) {
    x = screenWidth - contentSize.width - padding
  }

  // Vertical boundary checks with fallback placement
  if (y < statusBarHeight + padding) {
    // Not enough space at top, try bottom
    if (placement.includes('top')) {
      y = triggerPosition.y + triggerPosition.height + offset + arrowSize
      actualPlacement = placement.replace('top', 'bottom') as PopoverPlacement
    } else {
      y = statusBarHeight + padding
    }
  } else if (y + contentSize.height > safeScreenHeight - padding) {
    // Not enough space at bottom, try top
    if (placement.includes('bottom')) {
      y = triggerPosition.y - contentSize.height - offset - arrowSize
      actualPlacement = placement.replace('bottom', 'top') as PopoverPlacement
    } else {
      y = safeScreenHeight - contentSize.height - padding
    }
  }

  return { x, y, actualPlacement }
}

// Arrow component
const PopoverArrow = memo(
  ({
    placement,
    size = 8,
    triggerPosition,
    popoverPosition,
  }: {
    placement: PopoverPlacement
    size: number
    triggerPosition: PopoverPosition
    popoverPosition: { x: number; y: number }
  }) => {
    const arrowStyle = useAnimatedStyle(() => {
      let transform = [] as any[]
      let left: number | undefined = undefined
      let top: number | undefined = undefined
      let bottom: number | undefined = undefined
      let right: number | undefined = undefined

      // Calculate arrow position relative to popover
      const triggerCenter = {
        x: triggerPosition.x + triggerPosition.width / 2,
        y: triggerPosition.y + triggerPosition.height / 2,
      }

      switch (placement) {
        case 'top':
        case 'top-start':
        case 'top-end':
          transform = [{ rotate: '45deg' }]
          left = triggerCenter.x - popoverPosition.x - size / 2
          bottom = -size / 2
          break
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          transform = [{ rotate: '225deg' }]
          left = triggerCenter.x - popoverPosition.x - size / 2
          top = -size / 2
          break
        case 'left':
        case 'left-start':
        case 'left-end':
          transform = [{ rotate: '135deg' }]
          right = -size / 2
          top = triggerCenter.y - popoverPosition.y - size / 2
          break
        case 'right':
        case 'right-start':
        case 'right-end':
          transform = [{ rotate: '315deg' }]
          left = -size / 2
          top = triggerCenter.y - popoverPosition.y - size / 2
          break
      }

      return {
        position: 'absolute',
        left,
        top,
        right,
        bottom,
        width: size,
        height: size,
        backgroundColor: 'white',
        transform,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }
    }, [placement, triggerPosition, popoverPosition])

    if (
      !placement.includes('top') &&
      !placement.includes('bottom') &&
      !placement.includes('left') &&
      !placement.includes('right')
    ) {
      return null
    }

    return <Animated.View style={arrowStyle} />
  },
)

// Main Popover component
const Popover = forwardRef<PopoverRef, PopoverProps>(
  (
    {
      children,
      content,
      placement = 'bottom',
      offset = 8,
      isVisible: controlledVisible,
      onVisibilityChange,
      triggerStyle,
      contentStyle,
      overlayStyle,
      animationConfig = defaultSpringConfig,
      closeOnOutsidePress = true,
      closeOnBackdropPress = true,
      arrow = true,
      arrowSize = 8,
      disabled = false,
    },
    ref,
  ) => {
    // State
    const [internalVisible, setInternalVisible] = useState(false)
    const [triggerPosition, setTriggerPosition] = useState<PopoverPosition>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    })
    const [contentSize, setContentSize] = useState({ width: 200, height: 100 })
    const [actualPlacement, setActualPlacement] = useState(placement)

    // Refs
    const triggerRef = useRef<View>(null)

    // Controlled vs uncontrolled
    const isVisible =
      controlledVisible !== undefined ? controlledVisible : internalVisible

    // Animated values
    const scale = useSharedValue(0)
    const opacity = useSharedValue(0)

    // Calculate popover position
    const popoverPosition = calculatePopoverPosition(
      triggerPosition,
      contentSize,
      actualPlacement,
      offset,
      arrow ? arrowSize : 0,
    )

    // Animation functions
    const animateIn = useCallback(() => {
      'worklet'
      scale.value = withSpring(1, animationConfig as SpringConfig)
      opacity.value = withTiming(1, defaultTimingConfig)
    }, [scale, opacity, animationConfig])

    const animateOut = useCallback(() => {
      'worklet'
      scale.value = withSpring(0, { ...animationConfig, tension: 400 } as any)
      opacity.value = withTiming(0, defaultTimingConfig)
    }, [scale, opacity, animationConfig])

    // Visibility handlers
    const show = useCallback(() => {
      if (disabled) return

      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setTriggerPosition({ x, y, width, height })
        setActualPlacement(placement)

        if (controlledVisible === undefined) {
          setInternalVisible(true)
        }
        onVisibilityChange?.(true)
      })
    }, [disabled, controlledVisible, onVisibilityChange, placement])

    const hide = useCallback(() => {
      if (controlledVisible === undefined) {
        setInternalVisible(false)
      }
      onVisibilityChange?.(false)
    }, [controlledVisible, onVisibilityChange])

    const toggle = useCallback(() => {
      isVisible ? hide() : show()
    }, [isVisible, hide, show])

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        show,
        hide,
        toggle,
        isVisible,
      }),
      [show, hide, toggle, isVisible],
    )

    // Gesture handlers
    const tapGesture = Gesture.Tap().onEnd(() => {
      runOnJS(toggle)()
    })

    // Animation effects
    React.useEffect(() => {
      if (isVisible) {
        animateIn()
      } else {
        animateOut()
      }
    }, [isVisible, animateIn, animateOut])

    // Animated styles
    const backdropStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))

    const popoverStyle = useAnimatedStyle(() => {
      const scaleValue = scale.value

      return {
        position: 'absolute',
        left: popoverPosition.x,
        top: popoverPosition.y,
        opacity: opacity.value,
        transform: [
          { scale: scaleValue },
          {
            translateX: interpolate(
              scaleValue,
              [0, 1],
              [triggerPosition.width / 2, 0],
            ),
          },
          {
            translateY: interpolate(
              scaleValue,
              [0, 1],
              [triggerPosition.height / 2, 0],
            ),
          },
        ],
      }
    })

    const handleBackdropPress = useCallback(() => {
      if (closeOnBackdropPress) {
        hide()
      }
    }, [closeOnBackdropPress, hide])

    const handleContentLayout = useCallback((event: any) => {
      const { width, height } = event.nativeEvent.layout
      setContentSize({ width, height })
    }, [])

    return (
      <>
        {/* Trigger */}
        <GestureDetector gesture={tapGesture}>
          <View ref={triggerRef} style={triggerStyle}>
            {children}
          </View>
        </GestureDetector>

        {/* Popover Modal */}
        <Modal
          visible={isVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={hide}
        >
          {/* Backdrop */}
          <Pressable style={{ flex: 1 }} onPress={handleBackdropPress}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
                backdropStyle,
                overlayStyle,
              ]}
            />

            {/* Popover Content */}
            <Animated.View style={popoverStyle} onLayout={handleContentLayout}>
              {/* Arrow */}
              {arrow && (
                <PopoverArrow
                  placement={actualPlacement}
                  size={arrowSize}
                  triggerPosition={triggerPosition}
                  popoverPosition={popoverPosition}
                />
              )}

              {/* Content */}
              <View
                style={[
                  {
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                  },
                  contentStyle,
                ]}
              >
                {content}
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </>
    )
  },
)

export { Popover }
