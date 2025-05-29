import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Adicione useNavigate
import {
  Navbar,
  Collapse,
  Nav,
  NavItem,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
} from "reactstrap";
import Logo from "./Logo";
//import { ReactComponent as LogoWhite } from "./assets/images/logos/materialprowhite.svg";
import user1 from "./assets/images/users/user4.jpg";

const Cabecalho = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  const navigate = useNavigate(); // Instanciar useNavigate

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remova o token do localStorage
    navigate("/login"); // Redirecione para a página de login
  };

  return (
    <Navbar color="primary" dark expand="md" className="fix-header">
      <div className="d-flex align-items-center">
        <div className="d-lg-block d-none me-5 pe-3">
          <Logo />
        </div>
        <NavbarBrand href="/">
          {/*<LogoWhite className=" d-lg-none" />*/}
        </NavbarBrand>
        <Button
          color="primary"
          className=" d-lg-none"
          onClick={() => showMobilemenu()}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          <NavItem>
            <Link to="/starter" className="nav-link"></Link>
          </NavItem>
          <NavItem>
            <Link to="/about" className="nav-link"></Link>
          </NavItem>
        </Nav>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="transparent">
            <img
              src={user1}
              alt="profile"
              className="rounded-circle"
              width="30"
            ></img>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem>Minha conta</DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={async () => {
              const token = localStorage.getItem("token");
              if (!token) return alert("Usuário não autenticado.");

              const payload = JSON.parse(atob(token.split('.')[1]));
              const role = payload.role; // deve ser 'ADM'

              try {
                const response = await fetch("http://localhost:5001/api/permissoes"); // Essa rota deve retornar permissões por role
                const permissoes = await response.json();

                // Verifica se ADM pode acessar 'configuracoes'
                if (permissoes[role] && permissoes[role]["configuracoes"]) {
                  navigate("/configuracoes-de-seguranca");
                } else {
                  alert("Acesso negado: você não tem permissão para acessar as configurações.");
                }
              } catch (error) {
                console.error("Erro ao verificar permissões", error);
                alert("Erro ao verificar permissões");
              }
            }}>
              Configurações
            </DropdownItem>


            <DropdownItem onClick={handleLogout}>Sair</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};

export default Cabecalho;
