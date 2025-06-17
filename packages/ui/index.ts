import { cssInterop } from 'nativewind'
import { SolarIcon } from 'react-native-solar-icons'
cssInterop(SolarIcon, {
  className: {
    target: 'color',
    nativeStyleToProp: {
      color: 'color',
      width: 'size',
      height: 'size',
      fontSize: 'size',
    },
  },
})

export * from './components/WheelPicker'
