import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

import Page from './pages/Page';
// import NotFound from './pages/NotFound';

export default function App() {

  return (
    <>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Page />}></Route>
          {/* <Route path="/*" element={<NotFound />}></Route> */}
        </Routes>
      </BrowserRouter>

    </>
  );
}