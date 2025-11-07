import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Garante que JS do Bootstrap esteja disponível
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Componentes e Providers
import ProtectedRoute from './componentes/protect';
import Registro from './componentes/register';
import { LoadingProvider } from './providers/loading.provider'; // Assumindo que você usa isso

// Layouts das Páginas (Removidas duplicatas)
import LayoutAulas from './pages/Aulas';
import ConfiguracoesDeSeguranca from './pages/ConfiguracoesDeSeguranca';
import PagLogin from './pages/login';
import LayoutAtendimento from './pages/pagAtendimento';
import { LayoutConsultaFrequencia } from './pages/pagConsultaFrequencia';
import { LayoutDisciplina } from './pages/pagDisciplina';
import { LayoutMontarTurma } from './pages/pagMontarTurma';
import { LayoutRegistroFrequencia } from './pages/pagRegistroFrequencia';
import Layoutresponsavel from './pages/pagResponsavel';
import { LayoutSubstituicoes } from './pages/pagSubstituicoes';
import { LayoutTurma } from './pages/pagTurma';
import Layoutaluno from './pages/pagaluno';
import FullLayout from './pages/paginicial';
import { LayoutMatricula } from './pages/pagmatricula';
import Layoutprofessor from './pages/pagprofessor';
import Layoutnotifica from './pages/pagnotifica'; // Layout da TelaNotificacaoFaltas
import AcessoNegado from './pages/acessoNegado';
import { LayoutRelatorios } from './pages/pagRelatorios';
// Removida importação duplicada de alunoTurma.routes se existir, não estava no seu código original

function App() {
  return (
    // Se estiver usando LoadingProvider, envolva o BrowserRouter
    <LoadingProvider>
      <div className='App'>
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path='/' element={<PagLogin />} />
            <Route path='/login' element={<PagLogin />} />
            <Route path='/registro' element={<Registro />} />
            <Route path='/acesso-negado' element={<AcessoNegado />} />

            {/* Rotas Protegidas */}
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
                <ProtectedRoute allowedPermissions={['aulas']}> {/* Verifique a permissão correta */}
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
            {/* Rota para TelaNotificacaoFaltas */}
            <Route
              path='/notifica'
              element={
                <ProtectedRoute allowedPermissions={['registrofrequencia', 'notifica']}> {/* Ou a permissão correta */}
                  <Layoutnotifica />
                </ProtectedRoute>
              }
            />
             <Route
              path='/atendimento'
              element={
                <ProtectedRoute allowedPermissions={['atendimento']}> {/* Verifique a permissão correta */}
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
              path='/configuracoes-de-seguranca' // Rota para TelaConfiguracoes (antiga Seguranca)
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
                <ProtectedRoute allowedPermissions={['registrofrequencia', 'consultarfrequencia']}> {/* Ou a permissão correta */}
                  <LayoutConsultaFrequencia />
                </ProtectedRoute>
              }
            />
            <Route
              path='/pagSubstituicoes'
              element={
                <ProtectedRoute allowedPermissions={['substituicoes']}> {/* Verifique a permissão correta */}
                  <LayoutSubstituicoes/>
                </ProtectedRoute>
              }
            />

            <Route
            path='/relatorios'
            element={
              <ProtectedRoute allowedPermissions={['relatorios', 'registrofrequencia', 'adm']}>
                <LayoutRelatorios />
              </ProtectedRoute>
            }
          />

            {/* Rota Catch-all para 404 ou redirecionamento pode ser adicionada aqui */}
            {/* <Route path="*" element={<NotFound />} /> */}

          </Routes>

          {/* ToastContainer fora do Routes */}
          <ToastContainer position='bottom-right' autoClose={5000} style={{ zIndex: 99999 }}/>
        </BrowserRouter>
      </div>
    </LoadingProvider>
  );
}

export default App;