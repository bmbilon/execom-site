import { redirect } from 'next/navigation'

// /portal/admin has no UI of its own — for execom staff, the dashboard
// at /portal/dashboard now serves as the admin overview (queue counts
// + tiles). The admin/ layout already gates on is_execom_staff, so by
// the time this redirect fires we know the visitor is allowed in.
export default function AdminIndexPage() {
  redirect('/portal/dashboard')
}
