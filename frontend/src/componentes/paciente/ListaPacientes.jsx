import React, { useState, useEffect } from "react";
import { Modal, Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PacienteDetalhesModal from './PacienteDetalhesModal';
import FormularioPaciente from '../paciente/Paciente'; 
import { format } from 'date-fns';

const ListaPacientesModal = ({ show, onHide, onSelectPaciente }) => {
  const [pacientes, setPacientes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false); // Controle do modal de cadastro
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
            "Authorization": `Bearer ${token}`,
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

  const handleDelete = async (id) => {
    // Lógica para deletar paciente...
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
                    <Button variant="primary" onClick={() => handleDetalhes(paciente.id)}>
                      Detalhes
                    </Button>
                    {/*<Button variant="danger" onClick={() => handleDelete(paciente.id)} style={{ marginLeft: '10px' }}>
                      Apagar
                    </Button> Tiramos o botão de apagar, pois achamos melhor não ter essa opção por enquanto*/}
                    <Button variant="success" onClick={() => onSelectPaciente(paciente)} style={{ marginLeft: '10px' }}>
                      Selecionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {showModal && (
            <PacienteDetalhesModal show={showModal} onHide={closeModal} paciente={pacienteSelecionado} onSave={handleSave} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Fechar</Button>
          <Button variant="info" onClick={() => setShowCadastroModal(true)}>Cadastrar Paciente</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Cadastro de Pacientes */}
      <FormularioPaciente
        show={showCadastroModal}
        onHide={() => setShowCadastroModal(false)}
      />
    </>
  );
};

export default ListaPacientesModal;
