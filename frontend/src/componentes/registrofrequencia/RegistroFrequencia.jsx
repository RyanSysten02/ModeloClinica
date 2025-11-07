import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TurmaService from "../../services/Turma";
import DisciplinaService from '../../services/Disciplina';
import ModalConfirmacao from "../ModaisUteis/ModalConfirmação";

export default function TelaRegistroFrequencia() {
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [filtro, setFiltro] = useState({ turma: "", professor: "", disciplina: "" });

  const [alunos, setAlunos] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [filtrosConfirmados, setFiltrosConfirmados] = useState(false);
  const [menuInicial, setMenuInicial] = useState(true);
  const navigate = useNavigate();
  const [dataAula, setDataAula] = useState(new Date().toISOString().split("T")[0]);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmVariant: "primary",
  });

  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        const token = localStorage.getItem("token");
        const turmasData = await TurmaService.findAll();
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
        const respProfs = await fetch("http://localhost:5001/api/professor/allprofessor", { headers: { Authorization: `Bearer ${token}` } });
        if (!respProfs.ok) throw new Error("Falha ao carregar os professores.");
        const profsData = await respProfs.json();
        setProfessores(Array.isArray(profsData) ? profsData : []);
        const disciplinasData = await DisciplinaService.findAll();
        setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
      } catch (error) {
        toast.error(error.message || "Erro ao carregar dados iniciais.");
      }
    };
    fetchDadosIniciais();
  }, []);

  const buscarAlunos = async () => {
    if (!filtro.turma || !filtro.disciplina || !filtro.professor) {
      toast.warning("Selecione Turma, Disciplina e Professor antes de continuar.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`http://localhost:5001/api/matricula/por-turma/${filtro.turma}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error("Erro ao buscar alunos da turma.");
      const matriculasDaTurma = await resp.json();
      const matriculasAtivas = matriculasDaTurma.filter(m => m.status === 'ativa');
      const alunosParaFrequencia = matriculasAtivas.map(matricula => ({
        aluno_id: matricula.aluno_id,
        aluno_nome: matricula.aluno_nome,
        matricula_id: matricula.id,
      }));
      alunosParaFrequencia.sort((a, b) => a.aluno_nome.localeCompare(b.aluno_nome));
      setAlunos(alunosParaFrequencia);
      const presencasIniciais = alunosParaFrequencia.reduce((acc, aluno) => {
        acc[aluno.aluno_id] = true;
        return acc;
      }, {});
      setPresencas(presencasIniciais);
      setFiltrosConfirmados(true);
    } catch (error) {
      toast.error(error.message || "Erro ao buscar alunos da turma.");
    }
  };

  const togglePresenca = (id) => {
    setPresencas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmarFrequencia = async () => {
    const token = localStorage.getItem("token");
    const payload = alunos.map((aluno) => ({
      matricula_id: aluno.matricula_id,
      presente: presencas[aluno.aluno_id] || false,
      professor_id: parseInt(filtro.professor, 10),
      disciplina_id: parseInt(filtro.disciplina, 10),
      data_aula: dataAula,
    }));
    try {
      const resp = await fetch("http://localhost:5001/api/frequencia/cadastrafrequencia", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        toast.success("Frequência registrada com sucesso!");
        setMenuInicial(true);
        setFiltrosConfirmados(false);
        setAlunos([]);
        setFiltro({ turma: "", professor: "", disciplina: "" });
        setDataAula(new Date().toISOString().split("T")[0]);
      } else {
        const err = await resp.json();
        toast.error(err.message || "Erro ao registrar frequência.");
      }
    } catch (error) {
      toast.error("Erro de conexão ao registrar frequência.");
    }
  };

  const handleCloseModal = () => { setModalConfig({ ...modalConfig, show: false }); };
  const handleConfirmarFrequencia = () => {
    setModalConfig({
      show: true, title: "Confirmar Gravação", message: "Deseja realmente gravar esta frequência?",
      confirmVariant: "success", onConfirm: () => { confirmarFrequencia(); handleCloseModal(); },
    });
  };
  const handleVoltarAosFiltros = () => {
    setModalConfig({
      show: true, title: "Cancelar Alterações", message: "Deseja realmente voltar? As alterações não salvas serão perdidas.",
      confirmVariant: "danger", onConfirm: () => { setFiltrosConfirmados(false); handleCloseModal(); },
    });
  };
  const handleVoltarAoInicio = () => {
    if (filtrosConfirmados) {
      setModalConfig({
        show: true, title: "Sair da Página", message: "Deseja realmente voltar ao início? As alterações não salvas serão perdidas.",
        confirmVariant: "danger", onConfirm: () => { navigate("/paginicial"); handleCloseModal(); },
      });
    } else { navigate("/paginicial"); }
  };

  const fadeVariant = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Registro de Frequência</h2>
      <AnimatePresence mode="wait">
        {menuInicial ? (
          <motion.div key="menu-inicial" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
            
            <Row className="justify-content-center">
              <Col lg={9} xl={8}> {/* <-- Este Col limita a largura total do grid */}
                
                <Row className="g-4"> {/* <-- Esta é a sua Row original de cards */}
                  
                  <Col md={6}>
                    <Card className="shadow p-4 text-center" onClick={() => navigate("/pagConsultarFrequencias")} style={{ cursor: "pointer", aspectRatio: '1 / 1' }}>
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <i className="bi bi-journal-text display-4 text-primary mb-3"></i>
                        <h5 className="fw-bold">Consultar Lançamentos</h5>
                        <p className="text-muted">Visualize e edite registros já lançados.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="shadow p-4 text-center" onClick={() => setMenuInicial(false)} style={{ cursor: "pointer", aspectRatio: '1 / 1' }}>
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <i className="bi bi-plus-circle display-4 text-success mb-3"></i>
                        <h5 className="fw-bold">Lançar Nova Frequência</h5>
                        <p className="text-muted">Registre a frequência de uma nova aula.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="shadow p-4 text-center" onClick={() => navigate("/notifica")} style={{ cursor: "pointer", aspectRatio: '1 / 1' }}>
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <i className="bi bi-bell-fill display-4 text-warning mb-3"></i>
                        <h5 className="fw-bold">Notificar Ausências</h5>
                        <p className="text-muted">Envie avisos de faltas para os responsáveis.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="shadow p-4 text-center" onClick={() => navigate("/relatorios")} style={{ cursor: "pointer", aspectRatio: '1 / 1' }}>
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <i className="bi bi-bar-chart-line-fill display-4 text-info mb-3"></i> 
                        <h5 className="fw-bold">Relatórios e Gráficos</h5>
                        <p className="text-muted">Visualize dados e estatísticas.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                </Row>
              </Col>
            </Row>
            
          </motion.div>
        ) : !filtrosConfirmados ? (
          <motion.div key="filtros" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
            <Card className="shadow p-4">
              <Card.Body>
                {/* --- MODIFICADO: Layout dos filtros para 4 colunas --- */}
                <Row className="mb-3 g-3 align-items-end">
                  <Col md={3}><Form.Label>Turma</Form.Label>
                    <Form.Select value={filtro.turma} onChange={(e) => setFiltro({ ...filtro, turma: e.target.value })} >
                      <option value="">Selecione a Turma</option>
                      {turmas.map((t) => (<option key={t.id} value={t.id}>{t.nome}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}><Form.Label>Disciplina</Form.Label>
                    <Form.Select value={filtro.disciplina} onChange={(e) => setFiltro({ ...filtro, disciplina: e.target.value })} >
                      <option value="">Selecione a Disciplina</option>
                      {disciplinas.map((d) => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}><Form.Label>Professor</Form.Label>
                    <Form.Select value={filtro.professor} onChange={(e) => setFiltro({ ...filtro, professor: e.target.value })} >
                      <option value="">Selecione o Professor</option>
                      {professores.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}><Form.Label>Data da Aula</Form.Label>
                    <Form.Control type="date" value={dataAula} onChange={(e) => setDataAula(e.target.value)} />
                  </Col>
                </Row>
                <div className="d-flex justify-content-center mt-4">
                  <Button variant="primary" onClick={buscarAlunos}><i className="bi bi-search me-2"></i>Buscar Alunos</Button>
                </div>
              </Card.Body>
            </Card>
            <div className="d-flex justify-content-center mt-4">
              <Button variant="outline-secondary" onClick={() => setMenuInicial(true)}>
                <i className="bi bi-arrow-left me-2"></i>Voltar ao Menu Inicial
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="lista-alunos" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
            <div className="text-center mb-3">
              <p className="lead">Registrando frequência para a data: <strong>{new Date(dataAula).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong></p>
            </div>
            <Card className="shadow mt-3">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center fw-bold">
                <span>Lista de Alunos - Turma {turmas.find(t => t.id == filtro.turma)?.nome}</span>
                <span>Presente / Ausente</span>
              </Card.Header>
              <Card.Body>
                {alunos.map((aluno) => (
                  <Form.Check
                    key={aluno.aluno_id} type="switch" id={`aluno-${aluno.aluno_id}`} label={aluno.aluno_nome}
                    checked={presencas[aluno.aluno_id] || false} onChange={() => togglePresenca(aluno.aluno_id)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); togglePresenca(aluno.aluno_id); } }}
                    className="d-flex justify-content-between align-items-center flex-row-reverse mb-2 p-2 border-bottom"
                  />
                ))}
              </Card.Body>
            </Card>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="success" onClick={handleConfirmarFrequencia}><i className="bi bi-check-circle me-2"></i>Confirmar Frequência</Button>
              <Button variant="outline-primary" onClick={handleVoltarAosFiltros}><i className="bi bi-arrow-left me-2"></i>Voltar aos Filtros</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="d-flex justify-content-center mt-4">
        <Button variant="secondary" onClick={handleVoltarAoInicio}><i className="bi bi-house-door-fill me-2"></i>Voltar ao Início</Button>
      </div>
      <ModalConfirmacao
        show={modalConfig.show} onHide={handleCloseModal} onConfirm={modalConfig.onConfirm}
        title={modalConfig.title} message={modalConfig.message} confirmVariant={modalConfig.confirmVariant}
      />
    </Container>
  );
}