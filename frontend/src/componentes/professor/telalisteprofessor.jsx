import React, { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfessorDetalhesModal from "./ProfessorDetalhesModal";
import { format } from "date-fns";
import FormularioProfessor from "./Professor";

const TelaListaProfessores = ({ onSelectProfessor }) => {
  const [professores, setProfessores] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const navigate = useNavigate();

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
        setMensagemErro("Erro ao carregar os funcionários.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
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
          setMensagemErro("Dados do funcionário não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes do funcionário.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
    console.log("Tentando salvar:", formData);

    // Corrigir a data no formato aceito pelo MySQL (yyyy-MM-dd)
    if (formData.data_nasc) {
      try {
        const dataFormatada = format(
          new Date(formData.data_nasc),
          "yyyy-MM-dd"
        );
        formData.data_nasc = dataFormatada;
      } catch (e) {
        console.error("Erro ao formatar data:", e.message);
      }
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
        await fetchProfessores();
      } else {
        setMensagemErro("Erro ao salvar alterações do funcionário.");
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
        await fetchProfessores();
      } else {
        setMensagemErro("Erro ao apagar o funcionário.");
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
    <Container>
      <h1 className="mt-4">Lista de Professores</h1>
      <div className="m-2 d-flex justify-content-start">
        <Button variant="info" onClick={() => setShowCadastroModal(true)}>
          Cadastrar Professores
        </Button>
      </div>
      {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Registro</th>
            <th>Habilitação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {professores.map((professor) => (
            <tr key={professor.id}>
              <td>{professor.nome}</td>
              <td>{professor.num_regis}</td>
              <td>{professor.habilitacao}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => handleDetalhes(professor.id)}
                >
                  Detalhes
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

      <FormularioProfessor
        show={showCadastroModal}
        onHide={() => setShowCadastroModal(false)}
        onCadastroSuccess={fetchProfessores}
      />
    </Container>
  );
};

export default TelaListaProfessores;
