import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/report/$reportId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/report/$reportId/"!</div>
}
