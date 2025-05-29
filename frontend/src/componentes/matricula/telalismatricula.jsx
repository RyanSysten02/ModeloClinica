import React, { useState, useEffect, useMemo } from "react";
import { Container, Table, Button, InputGroup, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormularioMatricula from "./Matricula"; // Modal de cadastro
import MatriculaDetalhesModal from "./MatriculaDetalhesModal"; // Modal de detalhes (você precisa criar)
import { format } from "date-fns";

const TelaListaMatriculas = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const navigate = useNavigate();

  const matriculasOrdenadas = useMemo(() => {
    return [...matriculas].sort((a, b) =>
      a?.aluno?.nome?.localeCompare(b?.aluno?.nome)
    );
  }, [matriculas]);

  const matriculasFiltradas = useMemo(() => {
    const texto = searchText.toLowerCase();
    return matriculasOrdenadas.filter(
      (m) =>
        m?.aluno?.nome?.toLowerCase().includes(texto) ||
        m?.aluno?.cpf?.toLowerCase().includes(texto) ||
        m?.turma?.nome?.toLowerCase().includes(texto)
    );
  }, [searchText, matriculasOrdenadas]);

  const fetchMatriculas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/matricula/allmatricula", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        if (response.ok) {
            const data = await response.json();

            const adaptados = data.map((m) => ({
              ...m,
              aluno: { nome: m.aluno_nome, cpf: m.aluno_cpf },
              turma: { nome: m.turma_nome },
              responsavel: { nome: m.responsavel_nome },
              data: m.data_matricula,
            }));

            setMatriculas(adaptados);
          } else {
            toast.warning("Erro ao carregar as matrículas.");
          }

    } catch (error) {
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    fetchMatriculas();
  }, []);

  const handleDetalhes = (matricula) => {
    setMatriculaSelecionada(matricula);
    setShowDetalhesModal(true);
  };

 

  return (
    <Container>
      <h2 className="mt-4">Lista de Matrículas</h2>

      <div className="d-flex justify-content-start mb-3">
        <Button onClick={() => setShowCadastroModal(true)}>Nova Matrícula</Button>
      </div>

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Buscar por aluno ou turma"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button variant="outline-secondary">
          <i className="bi bi-search"></i>
        </Button>
      </InputGroup>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Turma</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {matriculasFiltradas.map((m) => (
            <tr key={m.id}>
              <td>{m.aluno?.nome}</td>
              <td>{m.turma?.nome}</td>
              <td>{format(new Date(m.data), "dd/MM/yyyy")}</td>
              <td style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Button variant="info" onClick={() => handleDetalhes(m)}>
                  Detalhes
                </Button>
                
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de cadastro */}
      <FormularioMatricula
        show={showCadastroModal}
        onHide={() => {
          setShowCadastroModal(false);
          fetchMatriculas();
        }}
      />

      {/* Modal de detalhes */}
      {showDetalhesModal && (
        <MatriculaDetalhesModal
          show={showDetalhesModal}
          onHide={() => {
            setShowDetalhesModal(false);
            setMatriculaSelecionada(null);
          }}
          matricula={matriculaSelecionada}
        />
      )}
    </Container>
  );
};

export default TelaListaMatriculas;
