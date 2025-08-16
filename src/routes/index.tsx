import { createFileRoute } from '@tanstack/react-router'
import { RootPage } from '../pages/RootPage'

export const Route = createFileRoute('/')({
  component: RootPage,
})
