export type ClassValue =
  | ClassArray
  | Record<string, boolean | null | undefined>
  | string
  | number
  | null
  | boolean
  | undefined

export type ClassArray = ClassValue[]

export function clsx(...inputs: ClassValue[]): string {
  const result: string[] = []

  for (let i = 0; i < inputs.length; i++) {
    const val = inputs[i]
    if (!val) continue

    if (typeof val === 'string' || typeof val === 'number') {
      result.push(String(val))
    } else if (Array.isArray(val)) {
      const inner = clsx(...val)
      if (inner) result.push(inner)
    } else if (typeof val === 'object') {
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key) && val[key]) {
          result.push(key)
        }
      }
    }
  }

  return result.join(' ')
}

export default clsx
