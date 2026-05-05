import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import TaskCreate from '../pages/TaskCreate';
import TaskDetail from '../pages/TaskDetail';
import History from '../pages/History';
import Projects from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import Calendar from '../pages/Calendar';
import TodoList from '../pages/TodoList';
import PageNotFound from '../pages/PageNotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { TaskProvider } from '../context/TaskContext';
import { ProjectProvider } from '../context/ProjectContext';
import { UIProvider } from '../context/UIContext';

export default function App(){
  return (
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
  )
}
