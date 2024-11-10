import { notFound } from "next/navigation"
import ShareDashboard from "./ShareDashboard"
import { getShare } from "./actions"

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @param {PageProps} searchParams - The query parameters from the URL.
 * @returns {Promise<JSX.Element>} The rendered chat analyses dashboard component or a redirect.
 */
const Page = async ({
  params,
}: {
  params: {
    shareId: string
  }
}): Promise<JSX.Element> => {
  const { shareId } = params

  const share = await getShare({ shareId })

  if (!share) {
    return notFound()
  }

  return <ShareDashboard share={share} />
}

export default Page
