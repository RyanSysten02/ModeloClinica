import React, { useState, useEffect, useMemo } from "react";
import { Container, Table, Button, InputGroup, Form, Collapse } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

  // seleção via checkbox (já existia no ajuste anterior)
  const [selecionados, setSelecionados] = useState({});
  const toggleSelecionado = (id) =>
    setSelecionados((prev) => ({ ...prev, [id]: !prev[id] }));

  // --- NOVO: estado e campos de Filtros ---
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroJaNotificados, setFiltroJaNotificados] = useState(false);
  const [filtroPendentes, setFiltroPendentes] = useState(false);
  // ----------------------------------------

  const alunosOrdenados = useMemo(() => {
    return [...alunos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos]);

  const alunosFiltrados = useMemo(() => {
    const currentSearch = searchText?.toLowerCase() || "";
    const list = alunosOrdenados.filter((aluno) => {
      return (
        aluno?.nome?.toLowerCase().includes(currentSearch) ||
        aluno?.cpf?.toLowerCase().includes(currentSearch)
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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleDetalhes = async (id) => { /* ...mantido... */ };
  const handleHistorico = async (id) => { /* ...mantido... */ };

  const handleSave = async (formData) => { /* ...mantido... */ };

  const closeModal = () => { setShowModal(false); setAlunoSelecionado(null); };
  const closeHistoricoModal = () => { setShowHistoricoModal(false); setAlunoSelecionado(null); };

  const handleExcluirAluno = async (id) => { /* ...mantido... */ };

  return (
    <Container>
      <h1 className="mt-4">Notificar faltas</h1>

      <div className="m-2 d-flex justify-content-start">
        <Button
          variant="info"
          onClick={() => window.open("https://wa.me/5551999999999", "_blank")}
        >
          Notifficar
        </Button>
      </div>

      <InputGroup className="mb-2">
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

      {/* --- NOVO: Botão de Filtros e painel colapsável --- */}
      <div className="mb-3">
        <Button variant="secondary" onClick={() => setShowFiltros((s) => !s)}>
          Filtros
        </Button>
        <Collapse in={showFiltros}>
          <div className="mt-3 p-3 border rounded">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Form.Label>Selecionar turma</Form.Label>
                <Form.Select
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                >
                  <option value="">Todas</option>
                  {/* Preencha com suas turmas reais */}
                  <option value="1A">1º A</option>
                  <option value="1B">1º B</option>
                  <option value="2A">2º A</option>
                </Form.Select>
              </div>

              <div className="col-12 col-md-4">
                <Form.Label>Data</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4 d-flex align-items-end gap-3">
                <Form.Check
                  type="checkbox"
                  label="Já notificados"
                  checked={filtroJaNotificados}
                  onChange={(e) => setFiltroJaNotificados(e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  label="Pendentes"
                  checked={filtroPendentes}
                  onChange={(e) => setFiltroPendentes(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </Collapse>
      </div>
      {/* --- Fim filtros --- */}

      {mensagemErro && <p className="text-danger">{mensagemErro}</p>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Quantidade de faltas</th>
            <th>Selecionar aluno</th>
          </tr>
        </thead>
        <tbody>
          {alunosFiltrados.map((aluno) => (
            <tr key={aluno.id}>
              <td>{aluno.nome}</td>
              <td>{aluno?.quantidadeFaltas ?? aluno?.faltas ?? 0}</td>
              <td style={{ textAlign: "center" }}>
                <Form.Check
                  type="checkbox"
                  checked={!!selecionados[aluno.id]}
                  onChange={() => toggleSelecionado(aluno.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

    </Container>
  );
};

export default TelaListaAlunos;
