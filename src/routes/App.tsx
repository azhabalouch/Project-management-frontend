import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import { ProtectedRoute } from './ProtectedRoute';

export default function App(){
  return (
    <Routes>
      {/* Public Routes */}
      <Route path='/login' element={<Login />}/>
      <Route path='/register' element={<Register />}/>

      {/* Protected Routes Block */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
    </Routes>
  )
}
