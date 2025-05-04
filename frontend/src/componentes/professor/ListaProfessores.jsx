import React, { useState, useEffect } from "react";
import { Modal, Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfessorDetalhesModal from "./ProfessorDetalhesModal";
import { format } from "date-fns";
import FormularioProfessor from "./Professor";

const ListaProfessoresModal = ({ show, onHide, onSelectProfessor }) => {
  const [professores, setProfessores] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfessores = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMensagemErro("Token não encontrado. Faça login novamente.");
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5001/api/professor/allprofessor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfessores(data);
        } else {
          setMensagemErro("Erro ao carregar os professores.");
        }
      } catch (error) {
        setMensagemErro("Erro ao conectar com o servidor.");
      }
    };

    fetchProfessores();
  }, [navigate]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/professor/professor/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProfessorSelecionado(data[0]);
          setShowModal(true);
        } else {
          setMensagemErro("Dados do professor não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes do professor.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
    console.log("Tentando salvar:", formData);

    if (formData.data_nasc) {
      formData.data_nasc = format(new Date(formData.data_nasc), "yyyy-MM-dd");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/professor/professor/${formData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Resposta do servidor:", data);

      if (response.ok) {
        setProfessores((prevState) =>
          prevState.map((p) => (p.id === formData.id ? formData : p))
        );
      } else {
        setMensagemErro("Erro ao salvar alterações do professor.");
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

      const response = await fetch(
        `http://localhost:5001/api/professor/professor/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setProfessores((prevState) => prevState.filter((p) => p.id !== id));
      } else {
        setMensagemErro("Erro ao apagar o professor.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setProfessorSelecionado(null);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Lista de Professores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Registro</th>
              <th>Função</th>
              <th>Habilitacao</th>
            </tr>
          </thead>
          <tbody>
            {professores.map((professor) => (
              <tr key={professor.id}>
                <td>{professor.nome}</td>
                <td>{professor.Registro}</td>
                <td>{professor.Habilitacao}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleDetalhes(professor.id)}
                  >
                    Detalhes
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => onSelectProfessor(professor)}
                    style={{ marginLeft: "10px" }}
                  >
                    Selecionar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {showModal && (
          <ProfessorDetalhesModal
            show={showModal}
            onHide={closeModal}
            professor={professorSelecionado}
            onSave={handleSave}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
        <Button variant="info" onClick={() => setShowCadastroModal(true)}>
          Cadastrar Professor
        </Button>
      </Modal.Footer>
      {/* Modal de Cadastro de Alunos */}
      <FormularioProfessor
        show={showCadastroModal}
        onHide={() => setShowCadastroModal(false)}
      />
    </Modal>
  );
};

export default ListaProfessoresModal;
