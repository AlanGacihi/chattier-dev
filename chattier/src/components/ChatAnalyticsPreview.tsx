import { HTMLAttributes } from "react"

interface ChatAnalyticsPreviewProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string
  dark?: boolean
}
const ChatAnalyticsPreview = ({
  imgSrc,
  className,
  dark = false,
  ...props
}: ChatAnalyticsPreviewProps) => {
  return (
    <div className={className} {...props}>
      <div className="relative">
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="object-cover min-w-full min-h-full"
            src={imgSrc}
            width={416}
            height={1403}
            alt="overlaying chat analytics image"
          />
        }
      </div>
    </div>
  )
}

export default ChatAnalyticsPreview
