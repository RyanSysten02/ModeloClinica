import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Adicionar from "../componentes/agenda/adicionar/Adicionar";
import ListaProfessoresModal from "../componentes/professor/ListaProfessores";
import ListaAlunosModal from "../componentes/aluno/ListaAlunos";
import ListaResponsavelsModal from "../componentes/responsavel/ListaResponsavels";

const RouteModals = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showProfessoresModal, setShowProfessoresModal] = useState(false);
  const [showAlunosModal, setShowAlunosModal] = useState(false);
  const [showResponsavelsModal, setShowResponsavelsModal] = useState(false);

  React.useEffect(() => {
    switch (location.pathname) {
      case "/consultamodal":
        setShowAdicionarModal(true);
        break;
      case "/professoresmodal":
        setShowProfessoresModal(true);
        break;
      case "/alunomodal":
        setShowAlunosModal(true);
        break;
      case "/responsavelmodal":
          setShowResponsavelsModal(true);
        break;
      default:
        setShowAdicionarModal(false);
        setShowProfessoresModal(false);
        setShowAlunosModal(false);
        setShowResponsavelsModal(false);
        break;
    }
  }, [location.pathname]);

  const handleClose = () => {
    navigate("/paginicial");
  };

  return (
    <>
      <Adicionar show={showAdicionarModal} onHide={handleClose} />
      <ListaProfessoresModal show={showProfessoresModal} onHide={handleClose} />
      <ListaAlunosModal show={showAlunosModal} onHide={handleClose} />
      <ListaResponsavelsModal show={showResponsavelsModal} onHide={handleClose} />
    </>
  );
};

export default RouteModals;
