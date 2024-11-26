import React from 'react';
import './App.css';
import Login from './componentes/login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './componentes/protect';
import Registro from './componentes/register';
import Calendario from './componentes/Calendario';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PagLogin from './pages/login';
import FullLayout from './pages/paginicial';
import TelaFuncionario from './pages/telafuncionario';
import RouteModals from './componentes/RouteModals'; // Importa o componente de modais

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PagLogin />} />
          <Route path="/login" element={<PagLogin />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/paginicial" element={<ProtectedRoute><FullLayout /></ProtectedRoute>} />
          <Route path="/pagFuncionario" element={<ProtectedRoute><TelaFuncionario /></ProtectedRoute>} />
        </Routes>
        {/* Adiciona os modais controlados por rota */}
        <RouteModals />
      </div>
    </Router>
  );
}

export default App;
