import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
// import Register from '../pages/Register';
import Home from '../pages/Home';
import TaskCreate from '../pages/TaskCreate';
import PageNotFound from '../pages/PageNotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

export default function App(){
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path='/login' element={<Login />}/>
        {/* <Route path='/register' element={<Register />}/> */}
      </Route>

      {/* Protected Routes Block */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/task-create" element={<TaskCreate />} />
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<PageNotFound />} /> 
    </Routes>
  )
}
