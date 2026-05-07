import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Pages & Routing
import Login from '../pages/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Context Providers
import { TaskProvider } from '../context/TaskContext';
import { ProjectProvider } from '../context/ProjectContext';
import { UIProvider } from '../context/UIContext';

// Lazy-loaded Pages
const Home = lazy(() => import('../pages/Home'));
const TaskCreate = lazy(() => import('../pages/TaskCreate'));
const TaskDetail = lazy(() => import('../pages/TaskDetail'));
const History = lazy(() => import('../pages/History'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));
const Calendar = lazy(() => import('../pages/Calendar'));
const TodoList = lazy(() => import('../pages/TodoList'));
const PageNotFound = lazy(() => import('../pages/PageNotFound'));

/**
 * Fallback UI displayed while lazy-loaded route chunks are being fetched.
 * 
 * @returns {JSX.Element} A centered loading spinner.
 */
const LoadingFallback = () => (
  <div className='flex h-screen w-full items-center justify-center bg-surface-main'>
    <div className='h-10 w-10 animate-spin rounded-full border-[3px] border-bg-input border-t-brand-primary' />
  </div>
);

/**
 * A layout wrapper that injects all necessary global contexts.
 * React Router v6 nested routes require an <Outlet /> to render child routes,
 * whereas standard providers use {children}. This bridge solves that mismatch.
 * 
 * @returns {JSX.Element} Nested providers wrapping the router Outlet.
 */
const AppProviders = () => (
  <UIProvider>
    <TaskProvider>
      <ProjectProvider>
        <Outlet />
      </ProjectProvider>
    </TaskProvider>
  </UIProvider>
);

/**
 * Main Application Component
 * Handles global routing, route protection, lazy-loading, and context provision.
 * 
 * @returns {JSX.Element} The root application router.
 */
export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        
        {/* Public Routes (Accessible only when logged out) */}
        <Route element={<PublicRoute />}>
          <Route path='/login' element={<Login />} />
        </Route>

        {/* Protected Routes (Accessible only when logged in) */}
        <Route element={<ProtectedRoute />}>
          {/* Inject Global States for authenticated users */}
          <Route element={<AppProviders />}>
            <Route path='/' element={<Home />} />
            <Route path='/task-create' element={<TaskCreate />} />
            <Route path='/task/:id' element={<TaskDetail />} />
            <Route path='/history' element={<History />} />
            <Route path='/projects' element={<Projects />} />
            <Route path='/project/:id' element={<ProjectDetail />} />
            <Route path='/calendar' element={<Calendar />} />
            <Route path='/todo' element={<TodoList />} />
          </Route>
        </Route>

        {/* Catch-all route for unknown paths */}
        <Route path='*' element={<PageNotFound />} />
        
      </Routes>
    </Suspense>
  );
}