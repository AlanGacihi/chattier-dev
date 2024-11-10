import { BadgeDelta } from "@tremor/react"

/**
 * A component that displays a badge indicating a percentage change.
 * The badge displays either a moderate increase or decrease depending on the `value` prop.
 *
 * @param {Object} props - The component props.
 * @param {number} props.value - The numerical value representing the percentage change.
 *                               If the value is negative, it indicates a decrease, otherwise an increase.
 *
 * @returns {JSX.Element} A badge component showing the formatted percentage value.
 */
const MyBadge = ({ value }: { value: number }): JSX.Element => {
  if (value < 0) {
    return (
      <BadgeDelta
        deltaType="moderateDecrease"
        isIncreasePositive={true}
        size="xs"
      >
        {Math.abs(value).toFixed(0)}%
      </BadgeDelta>
    )
  } else {
    return (
      <BadgeDelta
        deltaType="moderateIncrease"
        isIncreasePositive={true}
        size="xs"
      >
        {value.toFixed(0)}%
      </BadgeDelta>
    )
  }
}

export default MyBadge
