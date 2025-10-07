import React, { useState, useEffect } from "react";
import { Container, Table, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfessorDetalhesModal from "./ProfessorDetalhesModal";
import { format } from "date-fns";
import FormularioProfessor from "./Professor";
import { toast } from "react-toastify";

const TelaListaProfessores = ({ onSelectProfessor }) => {
  const [professores, setProfessores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [filtroNome, setFiltroNome] = useState("");
  const navigate = useNavigate();

  const fetchProfessores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
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
        data.sort((a, b) => a.nome.localeCompare(b.nome));
        setProfessores(data);
      } else {
        toast.warning("Erro ao carregar os funcionários.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, [navigate]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
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
          toast.warning("Dados do funcionário não encontrados.");
        }
      } else {
        toast.warning("Erro ao carregar detalhes do funcionário.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
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
        toast.warning("Token não encontrado. Faça login novamente.");
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

      if (response.ok) {
        await fetchProfessores();
        toast.success("Alterações salvas com sucesso."); // ✅ Toast de sucesso
      } else {
        toast.warning(data.message || "Erro ao salvar alterações do funcionário.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  const handleDelete = async (id) => {
    const confirmacao = window.confirm(
      "Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita."
    );
    if (!confirmacao) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
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
        toast.success("Professor excluído com sucesso.");
        await fetchProfessores();
      } else {
        toast.warning("Erro ao apagar o funcionário.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setProfessorSelecionado(null);
  };

  const professoresFiltrados = professores.filter((professor) =>
    professor.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  return (
    <Container>
      <h1 className="mt-4">Lista de Professores</h1>
      <Row className="m-2">
        <Col md="auto">
          <Button variant="info" onClick={() => setShowCadastroModal(true)}>
            Cadastrar Professores
          </Button>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Pesquisar por nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {professoresFiltrados.map((professor) => (
            <tr key={professor.id}>
              <td>{professor.nome}</td>
              
              <td>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => handleDetalhes(professor.id)}
                >
                  Detalhes
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(professor.id)}
                >
                  Excluir
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
