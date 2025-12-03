import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Nav, NavItem } from 'reactstrap';
import Adicionar from '../componentes/agenda/adicionar/Adicionar';
import probg from '../componentes/assets/images/bg/download.jpg';
import user1 from '../componentes/assets/images/users/user4.jpg';
import ListaProfessoresModal from '../componentes/professor/ListaProfessores';
import './sibar2.css';

const Sidebar = () => {
  const [userName, setUserName] = useState('');
  const [permissoes, setPermissoes] = useState([]);
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showProfessoresModal, setShowProfessoresModal] = useState(false);
  const navigate = useNavigate();

  const showMobilemenu = () => {
    document.getElementById('sidebarArea').classList.toggle('showSidebar');
  };

  const podeAcessar = (recurso) => {
    return Array.isArray(permissoes) && permissoes.includes(recurso);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.nome);

      fetch('http://localhost:5001/api/permissoes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const role = decoded.role;
          const permissoesDaRole = data[role] || {};
          const recursosPermitidos = Object.entries(permissoesDaRole)
            .filter(([_, permitido]) => permitido)
            .map(([recurso]) => recurso);
          setPermissoes(recursosPermitidos);
        })
        .catch((err) => {
          console.error('Erro ao buscar permissões:', err);
          setPermissoes([]);
        });
    }
  }, []);

  return (
    <div className='sidebarArea'>
      <div className='d-flex align-items-center'></div>
      <div
        className='profilebg'
        style={{ background: `url(${probg}) no-repeat` }}
      >
        <div className='p-3'>
          <img src={user1} alt='user' width='50' className='rounded-circle' />
          <Button
            color='white'
            className='ms-auto text-white d-lg-none'
            onClick={() => showMobilemenu()}
          >
            <i className='bi bi-x'></i>
          </Button>
        </div>
        <div className='bg-dark text-white p-2 opacity-75'>
          {userName ? userName : ''}
        </div>
      </div>

      <div className='p-3 mt-2'>
        <Nav vertical className='sidebarNav'>
          <NavItem className='sidenav-bg'>
            <Button
              color='link'
              className='nav-link text-secondary py-3'
              onClick={() => navigate('/paginicial')}
            >
              <i className='bi bi-calendar-range'></i>
              <span className='ms-3 d-inline-block'>Minha Agenda</span>
            </Button>
          </NavItem>

          {podeAcessar('aluno') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagAulas')}
              >
                <i className='bi bi-table'></i>
                <span className='ms-3 d-inline-block'>Aulas</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('aluno') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagAluno')}
              >
                <i className='bi bi-person'></i>
                <span className='ms-3 d-inline-block'>Alunos</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('responsavel') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagResponsavel')}
              >
                <i className='bi bi-people'></i>
                <span className='ms-3 d-inline-block'>Responsáveis</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('professor') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagProfessor')}
              >
                <i className='bi bi-person-badge'></i>
                <span className='ms-3 d-inline-block'>Professores</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('matricula') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagMatricula')}
              >
                <i className='bi bi-backpack3'></i>
                <span className='ms-3 d-inline-block'>Matrícula</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('montarturma') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagMontarTurma')}
              >
                <i className='bi bi-backpack3'></i>
                <span className='ms-3 d-inline-block'>Montar Turma</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('disciplina') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagDisciplina')}
              >
                <i className='bi bi-book'></i>
                <span className='ms-3 d-inline-block'>Disciplinas</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('turma') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagTurma')}
              >
                <i className='bi bi-123'></i>
                <span className='ms-3 d-inline-block'>Turmas</span>
              </Button>
            </NavItem>
          )}
          {podeAcessar('registrofrequencia') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagRegistroFrequencia')}
              >
                <i className='bi bi-card-list'></i>
                <span className='ms-3 d-inline-block'>
                  Registrar Frequência
                </span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('registrofrequencia') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/pagSubstituicoes')}
              >
                <i className='bi bi-arrow-left-right'></i>
                <span className='ms-3 d-inline-block'>Substituições Prof.</span>
              </Button>
            </NavItem>
          )}

          {podeAcessar('configuracoes') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/configuracoes-de-seguranca')}
              >
                <i className='bi bi-gear'></i>
                <span className='ms-3 d-inline-block'>Configurações</span>
              </Button>
            </NavItem>
          )}
          {podeAcessar('cadastrousuario') && (
            <NavItem className='sidenav-bg'>
              <Button
                color='link'
                className='nav-link text-secondary py-3'
                onClick={() => navigate('/registro')}
              >
                <i className='bi bi-person-fill-lock'></i>
                <span className='ms-3 d-inline-block'>Novo Usuario</span>
              </Button>
            </NavItem>
          )}
          {/* Central de Relacionamento */}
          <NavItem className='sidenav-bg'>
            <Button
              color='link'
              className='nav-link text-secondary py-3'
              onClick={() => navigate('/centralRelacionamentos')}
            >
              <i className='bi bi-calendar-range'></i>
              <span className='ms-3 d-inline-block'>Relacionamento</span>
            </Button>
          </NavItem>
          {/* Relatório Atendimento */}
          <NavItem className='sidenav-bg'>
            <Button
              color='link'
              className='nav-link text-secondary py-3'
              onClick={() => navigate('/relatorioAtendimentos')}
            >
              <i className='bi bi-calendar-range'></i>
              <span className='ms-3 d-inline-block'>Relatório Atds.</span>
            </Button>
          </NavItem>
        </Nav>
      </div>

      {/* Modais */}
      <Adicionar
        show={showAdicionarModal}
        onHide={() => setShowAdicionarModal(false)}
      />
      <ListaProfessoresModal
        show={showProfessoresModal}
        onHide={() => setShowProfessoresModal(false)}
      />
    </div>
  );
};

export default Sidebar;
