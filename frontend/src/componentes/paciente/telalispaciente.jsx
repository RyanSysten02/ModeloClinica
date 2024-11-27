import React, { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PacienteDetalhesModal from "./PacienteDetalhesModal";
import FormularioPaciente from "../paciente/Paciente";
import { format } from "date-fns";

const TelaListaPacientes = ({ onSelectPaciente }) => {
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

        const response = await fetch("http://localhost:5001/api/paciente/allpaciente", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    // Lógica para obter detalhes do paciente...
  };

  const handleSave = async (formData) => {
    // Lógica para salvar as alterações do paciente...
  };

  const closeModal = () => {
    setShowModal(false);
    setPacienteSelecionado(null);
  };

  return (
    <Container>
        
      <h1 className="mt-4">Lista de Pacientes</h1>
      <div className="m-2 d-flex justify-content-start">
        <Button variant="info" onClick={() => setShowCadastroModal(true)}>
          Cadastrar Paciente
        </Button>
      </div>
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
                <Button variant="primary" onClick={() => handleDetalhes(paciente.id)}>
                  Detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {showModal && (
        <PacienteDetalhesModal
          show={showModal}
          onHide={closeModal}
          paciente={pacienteSelecionado}
          onSave={handleSave}
        />
      )}
      
      <FormularioPaciente
        show={showCadastroModal}
        onHide={() => setShowCadastroModal(false)}
      />
    </Container>
  );
};

export default TelaListaPacientes;

