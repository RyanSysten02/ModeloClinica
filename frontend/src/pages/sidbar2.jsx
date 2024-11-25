import { Button, Nav, NavItem } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import {jwtDecode} from 'jwt-decode'
import { useState, useEffect } from "react";
import user1 from "../componentes/assets/images/users/user4.jpg";
import probg from "../componentes/assets/images/bg/download.jpg";
import './sibar2.css';


const navigation = [
  { title: "Agenda", href: "/alerts", icon: "bi bi-calendar-week" },
  { title: "Agendar consultas", href: "/starter", icon: "bi bi-card-text" },
  { title: "Pacientes", href: "/alerts", icon: "bi bi-people" },
  { title: "Medicos", href: "/alerts", icon: "bi bi-person-square" },
  { title: "Funcionarios", href: "/alerts", icon: "bi bi-person-badge" },
];

const Sidebar = () => {
  const [userName, setUserName] = useState("");
  const location = useLocation();

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
    <div>
      <div className="d-flex align-items-center"></div>
      <div
        className="profilebg"
        style={{ background: `url(${probg}) no-repeat` }}
      >
        <div className="p-3 d-flex">
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
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.href}
                className={
                  location.pathname === navi.href
                    ? "active nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
