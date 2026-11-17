/** The four Bootstrap v6 password strength levels */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

/**
 * Points each criterion adds to the score (Bootstrap v6 `strength.ts` weights; each defaults to `1`)
 */
export interface PasswordStrengthWeights {
  /** Length is at least `minLength` */
  minLength: number
  /** Length is at least `minLength + 4` */
  extraLength: number
  /** Contains a lowercase letter */
  lowercase: number
  /** Contains an uppercase letter */
  uppercase: number
  /** Contains a digit */
  numbers: number
  /** Contains one of `!@#$%^&*(),.?":{}|<>` */
  special: number
  /** Contains at least two of those special characters */
  multipleSpecial: number
  /** Length is at least 16 */
  longPassword: number
}

export interface PasswordStrengthOptions {
  /** Minimum length that earns the `minLength` point. Default `8` */
  minLength?: number
  /** Points per criterion, merged with the defaults key by key */
  weights?: Partial<PasswordStrengthWeights>
  /** Highest score for `weak`, `fair` and `good`; anything above is `strong`. Default `[2, 4, 6]` */
  thresholds?: readonly [number, number, number]
  /** Replaces the built-in scoring. Not called for an empty password, which always scores `0` */
  scorer?: (password: string) => number
}

/** Payload of `BFormStrength`'s `change` event */
export interface PasswordStrengthChange {
  strength: PasswordStrength | null
  score: number
}
