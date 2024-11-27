import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PacienteDetalhesModal from "./PacienteDetalhesModal";
import FormularioPaciente from "../paciente/Paciente";

const ListaPacientesModal = ({ show, onHide, onSelectPaciente }) => {
  const [pacientes, setPacientes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMensagemErro("Token não encontrado. Faça login novamente.");
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5001/api/paciente/allpaciente",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPacientes(data);
        } else {
          setMensagemErro("Erro ao carregar os pacientes.");
        }
      } catch (error) {
        setMensagemErro("Erro ao conectar com o servidor.");
      }
    };

    fetchPacientes();
  }, [navigate]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/paciente/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const paciente = await response.json();
        setPacienteSelecionado(paciente);
        setShowModal(true);
      } else {
        setMensagemErro("Erro ao carregar detalhes do paciente.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/paciente/${formData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedPaciente = await response.json();
        setPacientes((prev) =>
          prev.map((p) => (p.id === updatedPaciente.id ? updatedPaciente : p))
        );
        setShowModal(false);
        setPacienteSelecionado(null);
      } else {
        setMensagemErro("Erro ao atualizar os dados do paciente.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPacienteSelecionado(null);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Lista de Pacientes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Plano de Saúde</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.nome}</td>
                  <td>{paciente.cpf}</td>
                  <td>{paciente.planoSaude}</td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => handleDetalhes(paciente.id)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => onSelectPaciente(paciente)}
                      style={{ marginLeft: "10px" }}
                    >
                      Selecionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Fechar
          </Button>
          <Button variant="info" onClick={() => setShowCadastroModal(true)}>
            Cadastrar Paciente
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalhes do Paciente */}
      {showModal && (
        <PacienteDetalhesModal
          show={showModal}
          onHide={closeModal}
          paciente={pacienteSelecionado}
          onSave={handleSave}
        />
      )}

      {/* Modal de Cadastro de Pacientes */}
      <FormularioPaciente
        show={showCadastroModal}
        onHide={() => setShowCadastroModal(false)}
      />
    </>
  );
};

export default ListaPacientesModal;
