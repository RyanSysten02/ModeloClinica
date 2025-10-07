import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TurmaService from "../../services/Turma";
import ModalConfirmacao from "../ModaisUteis/ModalConfirmação";

export default function TelaConsultarFrequencias() {
  // --- ESTADOS GERAIS E DE CONSULTA ---
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [periodos] = useState([
    { value: "manha", label: "Manhã" },
    { value: "tarde", label: "Tarde" },
    { value: "noite", label: "Noite" },
  ]);
  const [filtro, setFiltro] = useState({ turma: "", periodo: "", professor: "" });
  const [aulasLancadas, setAulasLancadas] = useState([]);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  
  // --- ESTADOS DE CONTROLE DE MODO E EDIÇÃO ---
  const [modo, setModo] = useState('consulta');
  const [aulaEmEdicao, setAulaEmEdicao] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [loading, setLoading] = useState(false);
  
  // --- ESTADO PARA O MODAL ---
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmVariant: "primary",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        const token = localStorage.getItem("token");
        const turmasData = await TurmaService.findAll();
        setTurmas(turmasData);
        const respProfs = await fetch("http://localhost:5001/api/professor/allprofessor", { headers: { Authorization: `Bearer ${token}` } });
        const profsData = await respProfs.json();
        setProfessores(profsData);
      } catch (error) { toast.error("Erro ao carregar dados para os filtros."); }
    };
    fetchDadosIniciais();
  }, []);

  useEffect(() => {
    if (modo === 'edicao' && aulaEmEdicao) {
      const fetchDadosAula = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const url = new URL("http://localhost:5001/api/frequencia/detalhada");
          const params = {
            turma_id: aulaEmEdicao.turma_id,
            professor_id: aulaEmEdicao.professor_id,
            data_aula: new Date(aulaEmEdicao.data_aula).toISOString().split('T')[0],
            periodo: aulaEmEdicao.periodo,
          };
          Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
          
          const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!resp.ok) throw new Error("Não foi possível carregar os detalhes da aula.");
          
          const dadosFrequencia = await resp.json();
          const alunosDaAula = dadosFrequencia.map(d => ({ aluno_id: d.aluno_id, aluno_nome: d.aluno_nome, matricula_id: d.matricula_id }));
          const presencasIniciais = dadosFrequencia.reduce((acc, d) => {
            acc[d.aluno_id] = d.presente === 1;
            return acc;
          }, {});
          setAlunos(alunosDaAula);
          setPresencas(presencasIniciais);
        } catch (err) {
          toast.error(err.message);
          setModo('consulta');
        } finally {
          setLoading(false);
        }
      };
      fetchDadosAula();
    }
  }, [modo, aulaEmEdicao]);

  const buscarFrequencias = async () => {
    if (!filtro.turma || !filtro.periodo || !filtro.professor) {
      toast.warning("Selecione todos os filtros para buscar.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = new URL("http://localhost:5001/api/frequencia/agrupada");
      url.searchParams.append("turma_id", filtro.turma);
      url.searchParams.append("professor_id", filtro.professor);
      url.searchParams.append("periodo", filtro.periodo);
      
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error("Falha ao buscar frequências.");
      
      const data = await resp.json();
      setAulasLancadas(data);
      setBuscaRealizada(true);
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  const iniciarEdicao = (aula) => {
    setAulaEmEdicao(aula);
    setModo('edicao');
  };
  
  const cancelarEdicao = () => {
    setModo('consulta');
    setAulaEmEdicao(null);
    setAlunos([]);
    setPresencas({});
  };

  const togglePresenca = (alunoId) => {
    setPresencas(prev => ({ ...prev, [alunoId]: !prev[alunoId] }));
  };

  const salvarAlteracoes = async () => {
    const token = localStorage.getItem("token");
    const payload = alunos.map(aluno => ({
      matricula_id: aluno.matricula_id,
      professor_id: parseInt(aulaEmEdicao.professor_id, 10),
      presente: presencas[aluno.aluno_id] || false,
      data_aula: new Date(aulaEmEdicao.data_aula).toISOString().split('T')[0],
      periodo: aulaEmEdicao.periodo,
    }));
    
    try {
      const resp = await fetch("http://localhost:5001/api/frequencia/atualizar", {
        method: 'PUT',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || "Erro ao salvar alterações.");
      }
      toast.success("Frequência atualizada com sucesso!");
      cancelarEdicao();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCloseModal = () => {
    setModalConfig({ ...modalConfig, show: false });
  };

  const handleSalvarAlteracoes = () => {
    setModalConfig({
      show: true,
      title: "Confirmar Alterações",
      message: "Deseja realmente salvar as alterações nesta frequência?",
      confirmVariant: "success",
      onConfirm: () => {
        salvarAlteracoes();
        handleCloseModal();
      },
    });
  };

  const handleCancelarEdicao = () => {
    setModalConfig({
      show: true,
      title: "Cancelar Edição",
      message: "As alterações não salvas serão perdidas. Deseja continuar?",
      confirmVariant: "danger",
      onConfirm: () => {
        cancelarEdicao();
        handleCloseModal();
      },
    });
  };

  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <Container className="py-5">
      <AnimatePresence mode="wait">
        {modo === 'consulta' ? (
          <motion.div key="consulta" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-center mb-4">Consultar Frequências</h2>
            <Card className="shadow p-4 mb-4">
              <Card.Body>
                <Row className="mb-3 g-3">
                  <Col md={3}>
                    <Form.Select value={filtro.turma} onChange={(e) => setFiltro({ ...filtro, turma: e.target.value })}>
                      <option value="">Selecione a Turma</option>
                      {turmas.map((t) => (<option key={t.id} value={t.id}>{t.nome}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select value={filtro.periodo} onChange={(e) => setFiltro({ ...filtro, periodo: e.target.value })}>
                      <option value="">Selecione o Período</option>
                      {periodos.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select value={filtro.professor} onChange={(e) => setFiltro({ ...filtro, professor: e.target.value })}>
                      <option value="">Selecione o Professor</option>
                      {professores.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3} className="d-flex align-items-center">
                    <Button variant="primary" onClick={buscarFrequencias} className="w-100" disabled={loading}>
                      {loading ? <Spinner as="span" animation="border" size="sm" /> : <><i className="bi bi-search me-2"></i>Buscar</>}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {buscaRealizada && !loading && (
              <Card className="shadow">
                <Card.Body>
                  {aulasLancadas.length > 0 ? (
                    <Table hover responsive>
                      <thead><tr><th>Data</th><th>Turma</th><th>Professor</th><th>Período</th><th>Ações</th></tr></thead>
                      <tbody>
                        {aulasLancadas.map((aula) => (
                          <tr key={`${aula.data_aula}-${aula.turma_id}-${aula.professor_id}-${aula.periodo}`}>
                            <td>{new Date(aula.data_aula).toLocaleDateString("pt-BR", {timeZone: 'UTC'})}</td>
                            <td>{aula.turma_nome}</td>
                            <td>{aula.professor_nome}</td>
                            <td>{aula.periodo.charAt(0).toUpperCase() + aula.periodo.slice(1)}</td>
                            <td><Button variant="warning" size="sm" onClick={() => iniciarEdicao(aula)}><i className="bi bi-pencil me-1"></i>Editar</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (<p className="text-center text-muted m-3">Nenhum lançamento encontrado para os filtros selecionados.</p>)}
                </Card.Body>
              </Card>
            )}
             <div className="d-flex justify-content-center mt-4">
                <Button variant="secondary" onClick={() => navigate("/PagRegistroFrequencia")}>
                    <i className="bi bi-arrow-left me-2"></i>Voltar ao Registro
                </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="edicao" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-center mb-4">Editar Frequência</h2>
            {loading ? (<div className="text-center"><Spinner animation="border" /></div>) : (
              <>
                <p className="text-center text-muted">Data: {new Date(aulaEmEdicao.data_aula).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} | Período: {aulaEmEdicao.periodo.charAt(0).toUpperCase() + aulaEmEdicao.periodo.slice(1)}</p>
                <Card className="shadow mt-3">
                  <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center fw-bold"><span>Lista de Alunos</span><span>Presente / Ausente</span></Card.Header>
                  <Card.Body>
                    {alunos.map((aluno) => (
                      <Form.Check key={aluno.aluno_id} type="switch" id={`aluno-${aluno.aluno_id}`} label={aluno.aluno_nome}
                        checked={presencas[aluno.aluno_id] || false} onChange={() => togglePresenca(aluno.aluno_id)}
                        className="d-flex justify-content-between align-items-center flex-row-reverse mb-2 p-2 border-bottom fs-5"
                      />
                    ))}
                  </Card.Body>
                </Card>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <Button variant="success" onClick={handleSalvarAlteracoes}><i className="bi bi-check-circle me-2"></i>Salvar Alterações</Button>
                  <Button variant="secondary" onClick={handleCancelarEdicao}><i className="bi bi-x-circle me-2"></i>Cancelar</Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ModalConfirmacao
        show={modalConfig.show}
        onHide={handleCloseModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmVariant={modalConfig.confirmVariant}
      />
    </Container>
  );
}