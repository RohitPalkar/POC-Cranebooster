import { createBrowserRouter, RouterProvider } from 'react-router'
import { StoreProvider } from '@/state/store'
import { AppShell } from '@/components/shell/AppShell'
import { RecordWorkspacePage } from '@/workspace/RecordWorkspace'
import { ListPage, ModulePage } from '@/pages/ListPage'
import { NotFound } from '@/pages/NotFound'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <ModulePage id="dashboard" /> },
        { path: 'settings', element: <ModulePage id="settings" /> },
        { path: ':module', element: <ModulePage /> },
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
