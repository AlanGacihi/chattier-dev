"use client"

import { CircleArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

/**
 * A component that renders a button to navigate back to the previous page.
 * It uses a circular arrow icon and changes the background color to green.
 *
 * @returns {JSX.Element} The rendered back button component.
 */
const BackButton = ({
  isNewAnalysis = false,
}: {
  isNewAnalysis?: boolean
}): JSX.Element => {
  const router = useRouter()

  return (
    <div
      onClick={() => {
        if (isNewAnalysis) {
          router.push("/dashboard")
        } else {
          router.back()
        }
      }}
      className="rounded-full bg-green-600 cursor-pointer"
    >
      <CircleArrowLeft className="text-white" />
    </div>
  )
}

export default BackButton
