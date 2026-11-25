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

/**
 * The highest score for each level; a score above `good` is `strong`
 * (Bootstrap v6 `strength.ts` thresholds)
 */
export interface PasswordStrengthThresholds {
  /** Highest score that is `weak`. Default `2` */
  weak: number
  /** Highest score that is `fair`. Default `4` */
  fair: number
  /** Highest score that is `good`. Default `6` */
  good: number
}

export interface PasswordStrengthOptions {
  /** Minimum length that earns the `minLength` point. Default `8` */
  minLength?: number
  /** Points per criterion, merged with the defaults key by key */
  weights?: Partial<PasswordStrengthWeights>
  /** Highest score per level, merged with the defaults key by key. Default `{weak: 2, fair: 4, good: 6}` */
  thresholds?: Partial<PasswordStrengthThresholds>
  /** Replaces the built-in scoring. Not called for an empty password, which always scores `0` */
  scorer?: (password: string) => number
}

/** Payload of `BFormStrength`'s `change` event */
export interface PasswordStrengthChange {
  strength: PasswordStrength | null
  score: number
}
