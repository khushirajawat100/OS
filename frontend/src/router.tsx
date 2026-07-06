import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BoardroomOverview from '@/components/layout/BoardroomOverview';
import SettingsPlaceholder from '@/components/layout/SettingsPlaceholder';
import ProjectsPlaceholder from '@/components/layout/ProjectsPlaceholder';
import CalendarPlaceholder from '@/components/layout/CalendarPlaceholder';
import ReportsPlaceholder from '@/components/layout/ReportsPlaceholder';
import ExecutiveWorkspace from '@/components/layout/ExecutiveWorkspace';
import { Login } from '@/components/auth/Login';
import { executives } from '@/config/executives';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <BoardroomOverview />
      },
      {
        path: 'projects',
        element: <ProjectsPlaceholder />
      },
      {
        path: 'calendar',
        element: <CalendarPlaceholder />
      },
      {
        path: 'reports',
        element: <ReportsPlaceholder />
      },
      {
        path: 'settings',
        element: <SettingsPlaceholder />
      },
      ...executives.map((exec) => ({
        path: exec.id,
        element: <ExecutiveWorkspace />
      }))
    ]
  }
]);
