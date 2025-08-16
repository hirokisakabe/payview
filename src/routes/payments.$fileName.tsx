import { createFileRoute } from '@tanstack/react-router'
import { PaymentPage } from '../pages/PaymentPage'

export const Route = createFileRoute('/payments/$fileName')({
  component: _PaymentPage,
})

function _PaymentPage() {
   const { fileName } = Route.useParams()
  return <PaymentPage fileName={fileName} />
}
