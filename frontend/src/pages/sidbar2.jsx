import { Button, Nav, NavItem } from "reactstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importação do hook
import { jwtDecode } from "jwt-decode";
import user1 from "../componentes/assets/images/users/user4.jpg";
import probg from "../componentes/assets/images/bg/download.jpg";
import "./sibar2.css";
import Adicionar from "../componentes/agenda/adicionar/Adicionar";
import ListaFuncionariosModal from "../componentes/funcionario/ListaFuncionarios";

const Sidebar = () => {
  const [userName, setUserName] = useState("");
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showFuncionariosModal, setShowFuncionariosModal] = useState(false);
  const navigate = useNavigate(); // Inicialização do hook

  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.nome);
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
          <NavItem className="sidenav-bg">
            <Button
              color="link"
              className="nav-link text-secondary py-3"
              onClick={() => navigate("/pagAluno")} // Navegação para a página
            >
              <i className="bi bi-person"></i>
              <span className="ms-3 d-inline-block">Alunos</span>
            </Button>
          </NavItem>
          <NavItem className="sidenav-bg">
            <Button
              color="link"
              className="nav-link text-secondary py-3"
              onClick={() => navigate("/pagAluno")} // Navegação para a página
            >
              <i className="bi bi-people"></i>
              <span className="ms-3 d-inline-block">Responsaveis</span>
            </Button>
          </NavItem>
          <NavItem className="sidenav-bg">
            <Button
            color="link"
            className="nav-link text-secondary py-3"
            onClick={() => navigate("/pagFuncionario")} // Navegação para a página
          >
              <i className="bi bi-person-badge"></i>
              <span className="ms-3 d-inline-block">Gerenciar Professores</span>
            </Button>
          </NavItem>
        </Nav>
      </div>
      {/* Modais */}
      <Adicionar
        show={showAdicionarModal}
        onHide={() => setShowAdicionarModal(false)}
      />
      <ListaFuncionariosModal
        show={showFuncionariosModal}
        onHide={() => setShowFuncionariosModal(false)}
      />
    </div>
  );
};

export default Sidebar;
