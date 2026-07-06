import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Budget } from './pages/Budget';
import { History } from './pages/History';
import { Cases } from './pages/Cases';
import { Data } from './pages/Data';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="presupuesto" element={<Budget />} />
          <Route path="historico" element={<History />} />
          <Route path="casos" element={<Cases />} />
          <Route path="datos" element={<Data />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
