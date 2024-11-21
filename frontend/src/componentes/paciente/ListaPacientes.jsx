import React, { useState, useEffect } from "react";
import { Modal, Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PacienteDetalhesModal from './PacienteDetalhesModal';
import { format } from 'date-fns';

const ListaPacientesModal = ({ show, onHide, onSelectPaciente }) => {
  const [pacientes, setPacientes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/paciente/paciente/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPacienteSelecionado(data[0]);
          setShowModal(true);
        } else {
          setMensagemErro("Dados do paciente não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes do paciente.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
    console.log('Tentando salvar:', formData);

    if (formData.dataNascimento) {
      const date = new Date(formData.dataNascimento);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      formData.dataNascimento = format(date, 'yyyy-MM-dd');
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/paciente/paciente/${formData.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (response.ok) {
        setPacientes(prevState =>
          prevState.map(p =>
            p.id === formData.id ? formData : p
          )
        );
      } else {
        setMensagemErro("Erro ao salvar alterações do paciente.");
      }
    } catch (error) {
      console.error("Erro na atualização:", error.message);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/paciente/paciente/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPacientes(prevState =>
          prevState.filter(p => p.id !== id)
        );
      } else {
        setMensagemErro("Erro ao apagar o paciente.");
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
                  <Button variant="danger" onClick={() => handleDelete(paciente.id)} style={{ marginLeft: '10px' }}>
                    Apagar
                  </Button>
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
      </Modal.Footer>
    </Modal>
  );
};

export default ListaPacientesModal;
