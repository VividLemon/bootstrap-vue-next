/**
 * A tick on a `BFormRange` track. A plain number is a tick at that value; the object form sets
 * the label explicitly (`''` renders the tick without a label)
 */
export type FormRangeTick = number | {value: number; label?: string}
