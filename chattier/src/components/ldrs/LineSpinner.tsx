"use client"

import { useEffect } from "react"

interface LineSpinnerProps {
  size?: number
  speed?: number
  color?: string
  stroke?: number
}

/**
 * A React component that renders a line spinner loader with customizable size, speed, color, and stroke width.
 *
 * Uses dynamic import to load the `lineSpinner` loader from the "ldrs" library and registers it.
 *
 * @param size - The size of the spinner (default is 30).
 * @param speed - The speed of the spinner's rotation (default is 1.75).
 * @param color - The color of the spinner (default is "black").
 * @param stroke - The stroke width of the spinner (default is 2).
 *
 * @returns A JSX element representing the line spinner loader.
 */
const LineSpinner = ({ size, speed, color, stroke }: LineSpinnerProps) => {
  useEffect(() => {
    async function getLoader() {
      const { lineSpinner } = await import("ldrs")
      lineSpinner.register()
    }
    getLoader()
  }, [])
  return (
    <l-line-spinner
      size={size ?? 30}
      speed={speed ?? 1.75}
      color={color ?? "black"}
      stroke={stroke ?? 2}
    ></l-line-spinner>
  )
}

export default LineSpinner
