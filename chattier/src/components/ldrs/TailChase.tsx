"use client"

import { useEffect } from "react"

/**
 * A React component that renders a tail chase loader with fixed size, speed, and color.
 *
 * Uses dynamic import to load the `tailChase` loader from the "ldrs" library and registers it.
 *
 * @returns A JSX element representing the tail chase loader.
 */
const TailChase = () => {
  useEffect(() => {
    async function getLoader() {
      const { tailChase } = await import("ldrs")
      tailChase.register()
    }
    getLoader()
  }, [])

  return <l-tail-chase size="30" speed="1.75" color="green"></l-tail-chase>
}

export default TailChase
