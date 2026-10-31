import { createBrowserRouter, RouterProvider } from 'react-router'
import { StoreProvider } from '@/state/store'
import { AppShell } from '@/components/shell/AppShell'
import { RecordWorkspacePage } from '@/workspace/RecordWorkspace'
import { Dashboard } from '@/pages/Dashboard'
import { ModuleOverview } from '@/pages/ModuleOverview'
import { ListPage } from '@/pages/ListPage'
import { SettingsHub } from '@/pages/SettingsHub'
import { QuotationWizard } from '@/pages/QuotationWizard'
import { NotFound } from '@/pages/NotFound'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'settings/:section?', element: <SettingsHub /> },
        { path: 'crm/enquiries/ENQ-1042/quotations/new', element: <QuotationWizard /> },
        { path: ':module', element: <ModuleOverview /> },
        { path: ':module/:list', element: <ListPage /> },
        { path: ':module/:list/:recordId/:tab?', element: <RecordWorkspacePage /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  )
}
