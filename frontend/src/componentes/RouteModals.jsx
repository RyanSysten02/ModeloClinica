import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Adicionar from "../componentes/agenda/adicionar/Adicionar";
import ListaFuncionariosModal from "../componentes/funcionario/ListaFuncionarios";
import ListaAlunosModal from "../componentes/aluno/ListaAlunos";

const RouteModals = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showFuncionariosModal, setShowFuncionariosModal] = useState(false);
  const [showAlunosModal, setShowAlunosModal] = useState(false);

  React.useEffect(() => {
    switch (location.pathname) {
      case "/consultamodal":
        setShowAdicionarModal(true);
        break;
      case "/funcionariosmodal":
        setShowFuncionariosModal(true);
        break;
      case "/alunomodal":
        setShowAlunosModal(true);
        break;
      default:
        setShowAdicionarModal(false);
        setShowFuncionariosModal(false);
        setShowAlunosModal(false);
        break;
    }
  }, [location.pathname]);

  const handleClose = () => {
    navigate("/paginicial"); 
  };

  return (
    <>
      <Adicionar show={showAdicionarModal} onHide={handleClose} />
      <ListaFuncionariosModal show={showFuncionariosModal} onHide={handleClose} />
      <ListaAlunosModal show={showAlunosModal} onHide={handleClose} />
    </>
  );
};

export default RouteModals;
