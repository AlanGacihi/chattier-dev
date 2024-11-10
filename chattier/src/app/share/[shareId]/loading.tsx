import Bouncy from "@/components/ldrs/Bouncy"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"

export default function Loading() {
  return (
    <MaxWidthWrapper className="flex-1 flex flex-col">
      <div className="flex flex-col w-full min-h-[calc(100vh-8.5rem-1px)] items-center justify-center">
        <Bouncy />
      </div>
    </MaxWidthWrapper>
  )
}
