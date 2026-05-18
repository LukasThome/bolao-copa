import { notFound } from 'next/navigation'
import { SetupWizard } from '@/components/setup/SetupWizard'

export default function SetupPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <SetupWizard />
}
