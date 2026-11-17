import {computed, type ComputedRef, type MaybeRefOrGetter, toValue} from 'vue'
import type {
  PasswordStrength,
  PasswordStrengthOptions,
  PasswordStrengthWeights,
} from '../../types/PasswordStrength'

const defaultWeights: Readonly<PasswordStrengthWeights> = {
  minLength: 1,
  extraLength: 1,
  lowercase: 1,
  uppercase: 1,
  numbers: 1,
  special: 1,
  multipleSpecial: 1,
  longPassword: 1,
}

const defaultThresholds = [2, 4, 6] as const

const specialChar = /[!@#$%^&*(),.?":{}|<>]/
const multipleSpecialChars = /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/

/**
 * Scores a password like Bootstrap v6's `strength.ts` (`_calculateScore`)
 */
const calculateScore = (password: string, options: Readonly<PasswordStrengthOptions>): number => {
  if (!password) return 0
  if (options.scorer !== undefined) return options.scorer(password)

  const weights = {...defaultWeights, ...options.weights}
  const minLength = options.minLength ?? 8
  let score = 0

  if (password.length >= minLength) score += weights.minLength
  if (password.length >= minLength + 4) score += weights.extraLength
  if (/[a-z]/.test(password)) score += weights.lowercase
  if (/[A-Z]/.test(password)) score += weights.uppercase
  if (/\d/.test(password)) score += weights.numbers
  if (specialChar.test(password)) score += weights.special
  if (multipleSpecialChars.test(password)) score += weights.multipleSpecial
  if (password.length >= 16) score += weights.longPassword

  return score
}

/**
 * Maps a score to a level like Bootstrap v6's `strength.ts` (`_scoreToStrength`)
 */
const scoreToStrength = (
  score: number,
  thresholds: readonly [number, number, number] = defaultThresholds
): PasswordStrength | null => {
  if (score === 0) return null
  const [weak, fair, good] = thresholds
  if (score <= weak) return 'weak'
  if (score <= fair) return 'fair'
  if (score <= good) return 'good'
  return 'strong'
}

/**
 * Scores a password with Bootstrap v6's password strength rules.
 * Pure computation: no DOM access, so it works during SSR.
 *
 * @param password The password, as a plain value, ref or getter
 * @param options Scoring options (`minLength`, `weights`, `thresholds`, `scorer`), as a plain value, ref or getter
 * @returns `score` (`0` for an empty password) and `strength` (`null` when the score is `0`)
 */
export const usePasswordStrength = (
  password: MaybeRefOrGetter<string>,
  options: MaybeRefOrGetter<Readonly<PasswordStrengthOptions> | undefined> = {}
): {
  score: ComputedRef<number>
  strength: ComputedRef<PasswordStrength | null>
} => {
  const score = computed(() => calculateScore(toValue(password) ?? '', toValue(options) ?? {}))
  const strength = computed(() => scoreToStrength(score.value, toValue(options)?.thresholds))
  return {score, strength}
}
