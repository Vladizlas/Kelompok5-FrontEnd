
import Login from './pages/Login';
import { BrowserRouter, Route, Routes} from "react-router-dom";
import Dashboard from './pages/Dashboard';

 function App() {
  return (
<div>
    <BrowserRouter>
<Routes>
  <Route path='/login' element={<Login/>}/>
  <Route path='dashboard' element={<Dashboard/>}/>
</Routes>
    </BrowserRouter>
</div>
  )
}

export default App;