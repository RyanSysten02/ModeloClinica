import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ProtectedRoute from './componentes/protect';
import Registro from './componentes/register';
import PagLogin from './pages/login';
import { LayoutDisciplina } from './pages/pagDisciplina';
import Layoutresponsavel from './pages/pagResponsavel';
import { LayoutTurma } from './pages/pagTurma';
import { LayoutRegistroFrequencia } from './pages/pagRegistroFrequencia';
import { LayoutConsultaFrequencia } from './pages/pagConsultaFrequencia';
import Layoutaluno from './pages/pagaluno';
import FullLayout from './pages/paginicial';
import Layoutprofessor from './pages/pagprofessor';
import { LayoutMatricula } from './pages/pagmatricula';
import ConfiguracoesDeSeguranca from './pages/ConfiguracoesDeSeguranca';
import AcessoNegado from './pages/acessoNegado';
import { LayoutSubstituicoes } from './pages/pagSubstituicoes';
import Layoutnotifica from './pages/pagnotifica';
import LayoutAtendimento from './pages/pagAtendimento';
import LayoutAulas from './pages/Aulas';
import { LayoutMontarTurma } from './pages/pagMontarTurma';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<PagLogin />} />
          <Route path='/login' element={<PagLogin />} />
          <Route path='/registro' element={<Registro />} />

          <Route
            path='/paginicial'
            element={
              <ProtectedRoute>
                <FullLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagAluno'
            element={
              <ProtectedRoute allowedPermissions={['aluno']}>
                <Layoutaluno />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagAulas'
            element={
              <ProtectedRoute allowedPermissions={['aluno']}>
                <LayoutAulas/>
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagResponsavel'
            element={
              <ProtectedRoute allowedPermissions={['responsavel']}>
                <Layoutresponsavel />
              </ProtectedRoute>
            }
          />

          <Route
            path='/notifica'
            element={
              <ProtectedRoute allowedPermissions={['notifica']}>
                <Layoutnotifica />
              </ProtectedRoute>
            }
          />
          <Route
            path='/atendimento'
            element={
              <ProtectedRoute allowedPermissions={['notifica']}>
                <LayoutAtendimento />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagProfessor'
            element={
              <ProtectedRoute allowedPermissions={['professor']}>
                <Layoutprofessor />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagMatricula'
            element={
              <ProtectedRoute allowedPermissions={['matricula']}>
                <LayoutMatricula />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagMontarTurma'
            element={
              <ProtectedRoute allowedPermissions={['montarturma']}>
                <LayoutMontarTurma />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagDisciplina'
            element={
              <ProtectedRoute allowedPermissions={['disciplina']}>
                <LayoutDisciplina />
              </ProtectedRoute>
            }
          />

          <Route
            path='/pagTurma'
            element={
              <ProtectedRoute allowedPermissions={['turma']}>
                <LayoutTurma />
              </ProtectedRoute>
            }
          />

          <Route
            path='/configuracoes-de-seguranca'
            element={
              <ProtectedRoute allowedPermissions={['configuracoes']}>
                <ConfiguracoesDeSeguranca />
              </ProtectedRoute>
            }
          />
          <Route
            path='/pagRegistroFrequencia'
            element={
              <ProtectedRoute allowedPermissions={['registrofrequencia']}>
                <LayoutRegistroFrequencia />
              </ProtectedRoute>
            }
          />
          <Route
            path='/pagConsultarFrequencias'
            element={
              <ProtectedRoute allowedPermissions={['registrofrequencia']}>
                <LayoutConsultaFrequencia />
              </ProtectedRoute>
            }
          />

                    <Route
            path='/pagSubstituicoes'
            element={
              <ProtectedRoute allowedPermissions={['registrofrequencia']}>
                <LayoutSubstituicoes/>
              </ProtectedRoute>
            }
          />

          <Route path='/acesso-negado' element={<AcessoNegado />} />
        </Routes>

        <ToastContainer position='bottom-right' autoClose={5000} />
      </BrowserRouter>
    </div>
  );
}

export default App;
