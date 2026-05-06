import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { TaskProvider } from '../context/TaskContext';
import { ProjectProvider } from '../context/ProjectContext';
import { UIProvider } from '../context/UIContext';

const Home = lazy(() => import('../pages/Home'));
const TaskCreate = lazy(() => import('../pages/TaskCreate'));
const TaskDetail = lazy(() => import('../pages/TaskDetail'));
const History = lazy(() => import('../pages/History'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));
const Calendar = lazy(() => import('../pages/Calendar'));
const TodoList = lazy(() => import('../pages/TodoList'));
const PageNotFound = lazy(() => import('../pages/PageNotFound'));

const LoadingFallback = () => (
  <div className='flex h-screen w-full items-center justify-center bg-surface-main'>
    <div className='h-10 w-10 animate-spin rounded-full border-[3px] border-bg-input border-t-brand-primary' />
  </div>
);

export default function App(){
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path='/login' element={<Login />}/>
        </Route>

        {/* Protected Routes Block */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UIProvider />}>
            <Route element={<TaskProvider />}>
              <Route element={<ProjectProvider />}>
                <Route path='/' element={<Home />} />
                <Route path='/task-create' element={<TaskCreate />} />
                <Route path='/task/:id' element={<TaskDetail />} />
                <Route path='/history' element={<History />}/>
                <Route path='/projects' element={<Projects />}/>
                <Route path='/project/:id' element={<ProjectDetail />}/>
                <Route path='/calendar' element={<Calendar />}/>
                <Route path='/todo' element={<TodoList />}/>
              </Route>
            </Route>
          </Route>
        </Route>

        {/* Catch-all route for 404 */}
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Suspense>
  )
}
