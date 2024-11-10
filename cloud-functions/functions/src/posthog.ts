import { PostHog } from "posthog-node"

const posthogClient = new PostHog(
  "phc_WJGyyFRc2Bo4jfCNc12QiP5P0051zdjQ6GV1cTkF9BW",
  { host: "https://eu.i.posthog.com" }
)

export default posthogClient
