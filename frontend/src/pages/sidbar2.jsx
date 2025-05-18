import { Button, Nav, NavItem } from "reactstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importação do hook
import { jwtDecode } from "jwt-decode";
import user1 from "../componentes/assets/images/users/user4.jpg";
import probg from "../componentes/assets/images/bg/download.jpg";
import "./sibar2.css";
import Adicionar from "../componentes/agenda/adicionar/Adicionar";
import ListaProfessoresModal from "../componentes/professor/ListaProfessores";

const Sidebar = () => {
  const [userName, setUserName] = useState("");
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showProfessoresModal, setShowProfessoresModal] = useState(false);
  const navigate = useNavigate(); // Inicialização do hook

  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  const [permissoes, setPermissoes] = useState([]);

  const podeAcessar = (recurso) => {
  return Array.isArray(permissoes) && permissoes.includes(recurso);
};


useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    setUserName(decoded.nome);

    // Buscar permissões do usuário
    fetch("http://localhost:5001/api/permissoes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const role = decoded.role; // <-- o campo deve existir no token
        const permissoesDaRole = data[role] || {};
        const recursosPermitidos = Object.entries(permissoesDaRole)
          .filter(([_, permitido]) => permitido)
          .map(([recurso]) => recurso);
        setPermissoes(recursosPermitidos); // ex: ['aluno', 'professor']
      })
      .catch((err) => {
        console.error("Erro ao buscar permissões:", err);
        setPermissoes([]);
      });
  }
}, []);



  return (
    <div className="sidebarArea">
      <div className="d-flex align-items-center"></div>
      <div
        className="profilebg"
        style={{ background: `url(${probg}) no-repeat` }}
      >
        <div className="p-3">
          <img src={user1} alt="user" width="50" className="rounded-circle" />
          <Button
            color="white"
            className="ms-auto text-white d-lg-none"
            onClick={() => showMobilemenu()}
          >
            <i className="bi bi-x"></i>
          </Button>
        </div>
        <div className="bg-dark text-white p-2 opacity-75">
          {userName ? userName : ""}
        </div>
      </div>
      <div className="p-3 mt-2">
        <Nav vertical className="sidebarNav">
          <NavItem className="sidenav-bg">
            <Button
              color="link"
              className="nav-link text-secondary py-3"
              onClick={() => navigate("/paginicial")}
            >
              <i className="bi bi-calendar-range"></i>
              <span className="ms-3 d-inline-block">Minha Agenda</span>
            </Button>
          </NavItem>
          <NavItem className="sidenav-bg">
            <Button
              color="link"
              className="nav-link text-secondary py-3"
              onClick={() => setShowAdicionarModal(true)}
            >
              <i className="bi bi-card-text"></i>
              <span className="ms-3 d-inline-block">Atribuir Aulas</span>
            </Button>
          </NavItem>
          {podeAcessar("aluno") && (
                <NavItem className="sidenav-bg">
                  <Button
                    color="link"
                    className="nav-link text-secondary py-3"
                    onClick={() => navigate("/pagAluno")}
                  >
                    <i className="bi bi-person"></i>
                    <span className="ms-3 d-inline-block">Alunos</span>
                  </Button>
                </NavItem>
              )}
          {podeAcessar("responsavel") && (
          <NavItem className="sidenav-bg">
            <Button
              color="link"
              className="nav-link text-secondary py-3"
              onClick={() => navigate("/pagResponsavel")} // Navegação para a página
            >
              <i className="bi bi-people"></i>
              <span className="ms-3 d-inline-block">Responsaveis</span>
            </Button>
          </NavItem>
          )}

          {podeAcessar("professor") && (
          <NavItem className="sidenav-bg">
            <Button
              color="link"
              className="nav-link text-secondary py-3"
              onClick={() => navigate("/pagProfessor")} // Navegação para a página
            >
              <i className="bi bi-person-badge"></i>
              <span className="ms-3 d-inline-block">Professores</span>
            </Button>
          </NavItem>
          )}
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
