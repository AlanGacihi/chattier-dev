import { cn } from "@/lib/utils"
import { ReactNode } from "react"

/**
 * A layout component that wraps its children within a maximum width container.
 * It applies a maximum width constraint and padding to ensure consistent layout across different screen sizes.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.className] - An optional additional CSS class name to apply to the wrapper.
 * @param {ReactNode} props.children - The content to be rendered within the wrapper.
 *
 * @returns {JSX.Element} The rendered container with applied styles and children.
 */

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => {
  return (
    <div
      className={cn(
        "h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20",
        className
      )}
    >
      {children}
    </div>
  )
}

export default MaxWidthWrapper
