import React from 'react';
import Login from './pages/Login';
import { BrowserRouter, Route, Routes} from "react-router-dom";

export default function App() {
  return (
<div>
    <BrowserRouter>
<Routes>
  <Route path='/login' element={<Login/>}/>
</Routes>
    </BrowserRouter>
</div>
  )
}

