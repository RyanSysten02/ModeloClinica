import React, { useState, useEffect, useMemo } from "react";
import { Container, Table, Button, InputGroup, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AlunoDetalhesModal from "./AlunoDetalhesModal";
import AlunoHistorico from "./historicoaluno";
import FormularioAluno from "./Aluno";
import { format } from "date-fns";
import { toast } from "react-toastify";

const TelaListaAlunos = ({ onSelectAluno }) => {
  const [alunos, setAlunos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [mensagemErroControle, setMensagemErroControle] = useState("");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  // Ordena a lista em ordem alfabética pelo nome
  const alunosOrdenados = useMemo(() => {
    return [...alunos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos]);

  const alunosFiltrados = useMemo(() => {
    const currentSearch = searchText?.toLowerCase() || "";
    const list = alunosOrdenados.filter((aluno) => {
      return (
        aluno?.nome?.toLowerCase().includes(currentSearch) ||
        aluno?.cpf?.toLowerCase().includes(currentSearch) ||
        aluno?.alunoTurma?.toLowerCase().includes(currentSearch)
      );
    });

    return list.length > 0 ? list : alunosOrdenados;
  }, [searchText, alunosOrdenados]);

  const fetchAlunos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/aluno/allaluno", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      } else {
        toast.warning("Erro ao carregar os alunos.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    fetchAlunos();
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
        `http://localhost:5001/api/aluno/aluno/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAlunoSelecionado(data[0]);
          setShowModal(true);
        } else {
          toast.warning("Dados do aluno não encontrados.");
        }
      } else {
        toast.warning("Erro ao carregar detalhes do aluno.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  const handleHistorico = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/consulta/historico/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.warning(data.message || "Erro ao carregar histórico do aluno.");
        return;
      }

      if (data) {
        setAlunoSelecionado({ id, ...data });
        setShowHistoricoModal(true);
        setMensagemErro("");
        setMensagemErroControle("");
      } else {
        toast.warning("Histórico do aluno não encontrado.");
      }
    } catch (error) {
      toast.warning("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
  if (formData.dataNascimento) {
    const date = new Date(formData.dataNascimento);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    formData.dataNascimento = format(date, "yyyy-MM-dd");
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Token não encontrado. Faça login novamente.");
      navigate("/login");
      return;
    }

    const response = await fetch(
      `http://localhost:5001/api/aluno/aluno/${formData.id}`,
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
      setAlunos((prevState) =>
        prevState.map((p) => (p.id === formData.id ? formData : p))
      );
      toast.success("Dados do aluno atualizados com sucesso!");
    } else {
      toast.error(data.message || "Erro ao salvar alterações do aluno.");
      throw new Error(data.message || "Erro ao salvar alterações.");
    }
  } catch (error) {
    toast.error(error.message || "Erro ao conectar com o servidor.");
    throw error;
  }
};


  const closeModal = () => {
    setShowModal(false);
    setAlunoSelecionado(null);
  };

  const closeHistoricoModal = () => {
    setShowHistoricoModal(false);
    setAlunoSelecionado(null);
  };

const handleExcluirAluno = async (id) => {
  const confirmado = window.confirm(
    "Tem certeza que deseja excluir este aluno?"
  );
  if (!confirmado) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Token não encontrado. Faça login novamente.");
      navigate("/login");
      return;
    }

    const response = await fetch(`http://localhost:5001/api/aluno/aluno/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json(); // <- pega a mensagem do backend

    if (response.ok) {
      toast.success("Aluno excluído com sucesso.");
      fetchAlunos();
    } else {
      toast.warning(data.message || "Erro ao apagar o aluno.");
    }
  } catch (error) {
    toast.warning("Erro ao conectar com o servidor.");
  }
};

  return (
    <Container>
      <h1 className="mt-4">Lista de Alunos</h1>
      <div className="m-2 d-flex justify-content-start">
        <Button variant="info" onClick={() => setShowCadastroModal(true)}>
          Cadastrar Aluno
        </Button>
      </div>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Busque o aluno"
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          aria-label="Busca de aluno"
        />
        <Button variant="outline-secondary" id="button-addon1">
          <i className="bi bi-search"></i>
        </Button>
      </InputGroup>

      {mensagemErro && <p className="text-danger">{mensagemErro}</p>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Turma</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunosFiltrados.map((aluno) => (
            <tr key={aluno.id}>
              <td>{aluno.nome}</td>
              <td>{aluno.cpf}</td>
              <td>{aluno.alunoTurma}</td>
              <td
                style={{
                  display: "inline-flex",
                  gap: 10,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="primary"
                  onClick={() => handleDetalhes(aluno.id)}
                >
                  Detalhes
                </Button>
                {/*<Button
                  variant="warning"
                  onClick={() => handleHistorico(aluno.id)}
                >
                  Histórico
                </Button>*/}
                <Button
                  variant="danger"
                  onClick={() => handleExcluirAluno(aluno.id)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de Detalhes do Aluno */}
      {showModal && (
        <AlunoDetalhesModal
          show={showModal}
          onHide={closeModal}
          aluno={alunoSelecionado}
          onSave={handleSave}
          mensagemErro={mensagemErroControle}
          setMensagemErro={setMensagemErroControle}
        />
      )}

      {showHistoricoModal && (
      <AlunoHistorico
        show={showHistoricoModal}
        onHide={closeHistoricoModal}
        alunoId={alunoSelecionado?.id}
        mensagemErroControle={mensagemErroControle}
      />
    )}


      {/* Modal de Cadastro de Aluno */}
      <FormularioAluno
        show={showCadastroModal}
        onHide={() => {
          setShowCadastroModal(false);
          fetchAlunos(); // Atualiza a lista de alunos após fechar o modal
        }}
        onAlunosAtualizados={fetchAlunos} // Passa a função para atualizar a lista
      />
    </Container>
  );
};

export default TelaListaAlunos;
