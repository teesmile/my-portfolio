import RouteTransition from "@/components/layout/route-transition";

/* A template re-mounts on every navigation where a layout would persist.
   That difference is the whole reason this file exists. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
