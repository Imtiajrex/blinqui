import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { cva, type VariantProps } from 'class-variance-authority'
import { StringToBoolean } from 'class-variance-authority/dist/types'

export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ConfigSchema = Record<string, Record<string, ClassValue>>
type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined
}

export { mergeClasses as cn, cva, type ConfigVariants, type VariantProps }
