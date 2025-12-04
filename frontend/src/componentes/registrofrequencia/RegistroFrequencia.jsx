import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf'; // --- NOVO: Importação do jsPDF
import autoTable from 'jspdf-autotable'; // --- NOVO: Importação do autoTable

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

  // --- NOVA FUNÇÃO: Gerar Ficha Manual PDF (RF_S8) ---
  const gerarFichaManualPDF = () => {
    if (alunos.length === 0) {
      toast.warning("Não há alunos listados para gerar a ficha.");
      return;
    }

    // 1. Recuperar nomes legíveis dos filtros
    const turmaNome = turmas.find(t => t.id == filtro.turma)?.nome || "N/A";
    const disciplinaNome = disciplinas.find(d => d.id == filtro.disciplina)?.nome || "N/A";
    const professorNome = professores.find(p => p.id == filtro.professor)?.nome || "N/A";
    
    // Formatar data para exibição (DD/MM/AAAA)
    const dataFormatada = new Date(dataAula).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    
    // Obter o dia da semana
    const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const diaSemana = diasSemana[new Date(dataAula).getUTCDay()];

    const doc = new jsPDF();

    // 2. Cabeçalho da Ficha
    doc.setFontSize(16);
    doc.text("Ficha de Frequência Manual", 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Turma: ${turmaNome}`, 14, 25);
    doc.text(`Disciplina: ${disciplinaNome}`, 14, 30);
    doc.text(`Professor: ${professorNome}`, 14, 35);
    
    doc.text(`Data: ${dataFormatada}`, 150, 25);
    doc.text(`Dia: ${diaSemana}`, 150, 30);

    // 3. Preparar dados para a tabela
    const tableBody = alunos.map((aluno, index) => [
      index + 1,           // Nº
      aluno.aluno_nome,    // Nome do Aluno
      "",                  // Coluna Vazia para Assinatura/Presença
      ""                   // Coluna Vazia para Observação
    ]);

    // 4. Gerar Tabela
    autoTable(doc, {
      startY: 40,
      head: [['Nº', 'Nome do Aluno', 'Presença (P) / Falta (F)', 'Observações']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 20, lineColor: 10 }, // Cabeçalho cinza claro
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // Coluna Nº
        1: { cellWidth: 'auto' },               // Coluna Nome
        2: { cellWidth: 40, halign: 'center' }, // Coluna Presença (para marcar X)
        3: { cellWidth: 50 }                    // Coluna Obs
      },
      styles: {
        lineColor: 10, // Linhas pretas para facilitar impressão manual
        lineWidth: 0.1,
        minCellHeight: 10 // Altura da linha maior para facilitar escrita manual
      }
    });

    // 5. Rodapé
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text("__________________________________________", 105, finalY, { align: "center" });
    doc.text("Assinatura do Professor", 105, finalY + 5, { align: "center" });

    // 6. Salvar PDF
    const nomeArquivo = `Ficha_Frequencia_${turmaNome.replace(/\s+/g, '_')}_${dataFormatada.replace(/\//g, '-')}.pdf`;
    doc.save(nomeArquivo);
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
  <Container className="py-4"> {/* Padding reduzido de 5 para 4 */}
    <h2 className="text-center mb-4">Registro de Frequência</h2>
    <AnimatePresence mode="wait">
      {menuInicial ? (
        <motion.div key="menu-inicial" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
          
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              {/* g-3 diminui um pouco o espaço entre os cards no mobile */}
              <Row className="g-3"> 
                
                {/* CARD 1 */}
                <Col xs={6} md={6}>
                  <Card 
                    className="shadow-sm border-0 h-100 text-center card-hover" 
                    onClick={() => navigate("/pagConsultarFrequencias")} 
                    style={{ cursor: "pointer", transition: '0.2s' }}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-3">
                      {/* fs-1 é grande, mas menor que display-4, ideal para mobile */}
                      <i className="bi bi-journal-text fs-1 text-primary mb-2"></i>
                      <h6 className="fw-bold mb-1">Consultar</h6>
                      {/* Oculta descrição em telas muito pequenas (opcional) ou deixa texto pequeno */}
                      <p className="text-muted small mb-0 d-none d-sm-block">Visualize e edite lançamentos.</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* CARD 2 */}
                <Col xs={6} md={6}>
                  <Card 
                    className="shadow-sm border-0 h-100 text-center card-hover" 
                    onClick={() => setMenuInicial(false)} 
                    style={{ cursor: "pointer", transition: '0.2s' }}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-3">
                      <i className="bi bi-plus-circle fs-1 text-success mb-2"></i>
                      <h6 className="fw-bold mb-1">Nova Frequência</h6>
                      <p className="text-muted small mb-0 d-none d-sm-block">Registre uma nova aula.</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* CARD 3 */}
                <Col xs={6} md={6}>
                  <Card 
                    className="shadow-sm border-0 h-100 text-center card-hover" 
                    onClick={() => navigate("/notifica")} 
                    style={{ cursor: "pointer", transition: '0.2s' }}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-3">
                      <i className="bi bi-bell-fill fs-1 text-warning mb-2"></i>
                      <h6 className="fw-bold mb-1">Notificar</h6>
                      <p className="text-muted small mb-0 d-none d-sm-block">Envie avisos de faltas.</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* CARD 4 */}
                <Col xs={6} md={6}>
                  <Card 
                    className="shadow-sm border-0 h-100 text-center card-hover" 
                    onClick={() => navigate("/relatorios")} 
                    style={{ cursor: "pointer", transition: '0.2s' }}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-3">
                      <i className="bi bi-bar-chart-line-fill fs-1 text-info mb-2"></i> 
                      <h6 className="fw-bold mb-1">Relatórios</h6>
                      <p className="text-muted small mb-0 d-none d-sm-block">Visualize estatísticas.</p>
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
              {/* --- AQUI ESTÁ O CABEÇALHO COM O BOTÃO --- */}
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center fw-bold">
                <span>Lista de Alunos - Turma {turmas.find(t => t.id == filtro.turma)?.nome}</span>
                
                {/* Div que agrupa o botão e o texto */}
                <div className="d-flex align-items-center gap-3">
                    <Button 
                        variant="light" 
                        size="sm" 
                        onClick={gerarFichaManualPDF}
                        title="Imprimir ficha para preenchimento manual"
                    >
                        {/* Se o ícone não aparecer, verifique se instalou o bootstrap-icons */}
                        <i className="bi bi-printer-fill me-1"></i> Ficha Manual
                    </Button>
                    <span>Presente / Ausente</span>
                </div>
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