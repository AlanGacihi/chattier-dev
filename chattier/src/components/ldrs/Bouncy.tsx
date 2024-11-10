"use client"

import { useEffect } from "react"

/**
 * Props for the `Bouncy` component.
 */
interface BouncyProps {
  /**
   * The size of the bouncy loader.
   * Defaults to 55 if not provided.
   */
  size?: number

  /**
   * The speed of the bouncy animation.
   * Defaults to 1.75 if not provided.
   */
  speed?: number

  /**
   * The color of the bouncy loader.
   * Defaults to "green" if not provided.
   */
  color?: string
}

/**
 * A React component that renders a bouncy loader with customizable size, speed, and color.
 *
 * Uses dynamic import to load the `bouncy` loader from the "ldrs" library and registers it.
 *
 * @param props - The properties for configuring the bouncy loader.
 * @param props.size - The size of the loader (optional).
 * @param props.speed - The speed of the animation (optional).
 * @param props.color - The color of the loader (optional).
 *
 * @returns A JSX element representing the bouncy loader.
 */
const Bouncy = ({ size, speed, color }: BouncyProps) => {
  useEffect(() => {
    async function getLoader() {
      const { bouncy } = await import("ldrs")
      bouncy.register()
    }
    getLoader()
  }, [])

  return (
    <l-bouncy
      size={size ?? 55}
      speed={speed ?? 1.75}
      color={color ?? "green"}
    ></l-bouncy>
  )
}

export default Bouncy
