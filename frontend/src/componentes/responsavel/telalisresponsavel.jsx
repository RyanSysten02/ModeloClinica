import React, { useState, useEffect } from "react";
import { Container, Table, Button, InputGroup, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ResponsavelDetalhesModal from "./ResponsavelDetalhesModal";
import ResponsavelHistorico from "./historicoresponsavel";
import FormularioResponsavel from "./Responsavel";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useMemo } from "react";

const TelaListaResponsavels = ({ onSelectResponsavel }) => {
  const [responsavels, setResponsavels] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [mensagemErroControle, setMensagemErroControle] = useState("");
  const [searchText, setSearchText] = useState();
  const navigate = useNavigate();

  const responsavelFiltrados = useMemo(() => {
    const list = responsavels?.filter((aluno) => {
      const currentSearch = searchText?.toLowerCase();

      return (
        aluno?.nome?.toLowerCase()?.includes(currentSearch) ||
        aluno?.cpf?.toLowerCase()?.includes(currentSearch) ||
        aluno?.alunoTurma?.toLowerCase()?.includes(currentSearch)
      );
    });

    return list?.length > 0 ? list : responsavels;
  }, [searchText, responsavels]);

  // Função para buscar todos os responsavels
  const fetchResponsavels = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5001/api/responsavel/allresponsavel",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponsavels(data);
      } else {
        setMensagemErro("Erro ao carregar os responsavels.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    fetchResponsavels(); // Carrega os responsavels ao iniciar a página
  }, [navigate]);

  // Função para buscar os detalhes do responsavel pelo ID
  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:5001/api/responsavel/responsavel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setResponsavelSelecionado(data[0]);
          setShowModal(true);
        } else {
          setMensagemErro("Dados do responsavel não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes do responsavel.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleHistorico = async (id) => {
    console.log("ID do responsavel:", id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/consulta/historico/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json(); // Pegando a resposta do backend

      if (!response.ok) {
        toast.warning(
          data.message || "Erro ao carregar histórico do responsavel."
        );
        return;
      }

      if (data) {
        setResponsavelSelecionado({ id, ...data });
        setShowHistoricoModal(true);
        setMensagemErro(""); // Limpa erro se carregar com sucesso
        setMensagemErroControle(""); // Limpa erro da API
      } else {
        setMensagemErro("Histórico do responsavel não encontrado.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  // Função para salvar as alterações do responsavel
  const handleSave = async (formData) => {
    console.log("Tentando salvar:", formData);

    if (formData.dataNascimento) {
      const date = new Date(formData.dataNascimento);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      formData.dataNascimento = format(date, "yyyy-MM-dd");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/responsavel/responsavel/${formData.id}`,
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
        setResponsavels((prevState) =>
          prevState.map((p) => (p.id === formData.id ? formData : p))
        );
      } else {
        setMensagemErro("Erro ao salvar alterações do responsavel.");
      }
    } catch (error) {
      console.error("Erro na atualização:", error.message);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  // Função para fechar o modal de detalhes
  const closeModal = () => {
    setShowModal(false);
    setResponsavelSelecionado(null);
  };

  const closeHistoricoModal = () => {
    setShowHistoricoModal(false);
    setResponsavelSelecionado(null);
  };

  const handleExcluirAluno = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      await fetch(`http://localhost:5001/api/responsavel/responsavel/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      fetchResponsavels();
    } catch (error) {
      console.error("Erro na exclusão:", error.message);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  return (
    <Container>
      <h1 className="mt-4">Lista de Responsavels</h1>
      <div className="m-2 d-flex justify-content-start">
        <Button variant="info" onClick={() => setShowCadastroModal(true)}>
          Cadastrar Responsavel
        </Button>
      </div>
      <InputGroup className="mb-3">
        <Form.Control
          aria-label="Example text with button addon"
          aria-describedby="basic-addon1"
          placeholder="Busque o responsavel"
          onChange={(e) => setSearchText(e.target.value)}
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
          {responsavelFiltrados?.map((responsavel) => (
            <tr key={responsavel.id}>
              <td>{responsavel.nome}</td>
              <td>{responsavel.cpf}</td>
              <td>{responsavel.responsavelTurma}</td>
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
                  onClick={() => handleDetalhes(responsavel.id)}
                >
                  Detalhes
                </Button>
                <Button
                  variant="warning"
                  onClick={() => handleHistorico(responsavel.id)}
                >
                  Histórico
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleExcluirAluno(responsavel?.id)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de Detalhes do Responsavel */}
      {showModal && (
        <ResponsavelDetalhesModal
          show={showModal}
          onHide={closeModal}
          responsavel={responsavelSelecionado}
          onSave={handleSave}
        />
      )}
      <ResponsavelHistorico
        show={showHistoricoModal}
        onHide={() => setShowHistoricoModal(false)}
        responsavelId={responsavelSelecionado?.id}
        mensagemErroControle={mensagemErroControle}
      />

      {/* Modal de Cadastro de Responsavel */}
      <FormularioResponsavel
        show={showCadastroModal}
        onHide={() => {
          setShowCadastroModal(false);
          fetchResponsavels(); // Atualiza a lista de responsavels após fechar o modal
        }}
        onResponsavelsAtualizados={fetchResponsavels} // Passa a função para atualizar a lista
      />
    </Container>
  );
};

export default TelaListaResponsavels;
