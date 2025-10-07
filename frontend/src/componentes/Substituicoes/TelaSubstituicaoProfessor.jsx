import React, { useState, useMemo } from 'react';
// A CORREÇÃO ESTÁ AQUI: ADICIONAMOS O 'Collapse'
import { Container, Row, Col, Card, Button, Modal, Form, Badge, ListGroup, Collapse } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ModalConfirmacao from '../ModaisUteis/ModalConfirmação';
import dayjs from 'dayjs';

// --- DADOS MOCADOS ---
// DADOS MOCADOS ENRIQUECIDOS
const todasAreas = {
  LINGUAGENS: 'Linguagens',
  EXATAS: 'Exatas',
  HUMANAS: 'Humanas',
  ARTES: 'Artes'
};

const todosProfessores = [
  // Docentes
  { id: 301, nome: 'Prof. Carlos Alberto', tipo: 'docente', areaConhecimento: todasAreas.EXATAS, cargaHoraria: 20 },
  { id: 302, nome: 'Prof.ª Ana Lúcia', tipo: 'docente', areaConhecimento: todasAreas.HUMANAS, cargaHoraria: 18 },
  { id: 303, nome: 'Prof. Ricardo Gomes', tipo: 'docente', areaConhecimento: todasAreas.LINGUAGENS, cargaHoraria: 22 },
  { id: 304, nome: 'Prof.ª Mariana Costa', tipo: 'docente', areaConhecimento: todasAreas.ARTES, cargaHoraria: 16 },
  { id: 305, nome: 'Prof. Fernando Dias', tipo: 'docente', areaConhecimento: todasAreas.EXATAS, cargaHoraria: 12 },
  
  // Coordenadores e Colaborativos
  { id: 401, nome: 'Coord. Lúcia Martins', tipo: 'coordenador', areaConhecimento: todasAreas.LINGUAGENS, cargaHoraria: 10 },
  { id: 402, nome: 'Coord. Pedro Álvares', tipo: 'coordenador', areaConhecimento: todasAreas.EXATAS, cargaHoraria: 8 },
  { id: 501, nome: 'Prof. Colab. Sandra Marques', tipo: 'colaborativo', areaConhecimento: todasAreas.LINGUAGENS, cargaHoraria: 15 },
];

const todasDisciplinas = [
    { id: 201, nome: 'Português', areaConhecimento: todasAreas.LINGUAGENS },
    { id: 202, nome: 'Matemática', areaConhecimento: todasAreas.EXATAS },
    { id: 203, nome: 'Geografia', areaConhecimento: todasAreas.HUMANAS },
    { id: 204, nome: 'História', areaConhecimento: todasAreas.HUMANAS },
    { id: 205, nome: 'Artes', areaConhecimento: todasAreas.ARTES },
];

const todasTurmas = [
    { id: 101, nome: 'Turma 6º Ano A - Matutino', nivel: 'Anos Finais' },
    { id: 102, nome: 'Turma 7º Ano B - Vespertino', nivel: 'Anos Finais' },
    { id: 103, nome: 'Turma 3º Ano C - Matutino', nivel: 'Anos Iniciais' }, // Adicionamos uma de Anos Iniciais
]

const alocacoesIniciais = [
    { id: 1, data: dayjs().format('YYYY-MM-DD'), turma: todasTurmas[0], disciplina: todasDisciplinas[1], horario: '08:00 - 09:00', professorAtual: todosProfessores[0], historicoSubstituicao: [] },
    { id: 2, data: dayjs().format('YYYY-MM-DD'), turma: todasTurmas[1], disciplina: todasDisciplinas[3], horario: '14:00 - 15:00', professorAtual: todosProfessores[1], historicoSubstituicao: [] },
    { id: 3, data: dayjs().add(1, 'day').format('YYYY-MM-DD'), turma: todasTurmas[2], disciplina: todasDisciplinas[0], horario: '10:00 - 11:00', professorAtual: todosProfessores[2], historicoSubstituicao: [] },
    { id: 4, data: dayjs().add(1, 'day').format('YYYY-MM-DD'), turma: todasTurmas[0], disciplina: todasDisciplinas[4], horario: '11:00 - 12:00', professorAtual: todosProfessores[3], historicoSubstituicao: [] },
    { id: 5, data: dayjs().add(2, 'day').format('YYYY-MM-DD'), turma: todasTurmas[1], disciplina: todasDisciplinas[2], horario: '16:00 - 17:00', professorAtual: todosProfessores[1], historicoSubstituicao: [] },
];

/**
 * Retorna uma lista de professores substitutos priorizada com base no Artigo 12.
 * @param {object} alocacao - O objeto da aula que precisa de substituição.
 * @param {array} todosOsProfessores - A lista completa de professores da escola.
 * @returns {array} Uma lista de professores ordenada e agrupada por prioridade.
 */
function getProfessoresSubstitutosPriorizados(alocacao, todosOsProfessores) {
  const professorAtualId = alocacao.professorAtual.id;
  const areaDaAula = alocacao.disciplina.areaConhecimento;
  
  // Filtra para não incluir o professor que será substituído
  const professoresDisponiveis = todosOsProfessores.filter(p => p.id !== professorAtualId);

  let listaPriorizada = [];

  // Regra para Anos Finais do Fundamental e Ensino Médio
  if (alocacao.turma.nivel === 'Anos Finais') {
    // Regra II.a: Docentes com menor carga horária na mesma área
    const regraII_a = professoresDisponiveis
      .filter(p => p.tipo === 'docente' && p.areaConhecimento === areaDaAula)
      .sort((a, b) => a.cargaHoraria - b.cargaHoraria);

    // Regra II.b: Docentes com menor carga horária em área diversa
    const regraII_b = professoresDisponiveis
      .filter(p => p.tipo === 'docente' && p.areaConhecimento !== areaDaAula)
      .sort((a, b) => a.cargaHoraria - b.cargaHoraria);

    // Regra II.c: Coordenadores da mesma área
    const regraII_c = professoresDisponiveis
      .filter(p => p.tipo === 'coordenador' && p.areaConhecimento === areaDaAula);

    // Regra II.d: Coordenadores de área com menor carga horária
    const regraII_d = professoresDisponiveis
      .filter(p => p.tipo === 'coordenador') // A regra é um pouco ambígua, vamos assumir todos os coordenadores
      .sort((a, b) => a.cargaHoraria - b.cargaHoraria);

    // Agrupando os resultados com rótulos de prioridade
    listaPriorizada = [
      { label: "Prioridade 1: Docentes da mesma área", opcoes: regraII_a },
      { label: "Prioridade 2: Docentes de outras áreas", opcoes: regraII_b },
      { label: "Prioridade 3: Coordenadores", opcoes: [...regraII_c, ...regraII_d.filter(p => p.areaConhecimento !== areaDaAula)] } // Unimos os coordenadores para evitar duplicatas
    ];
  }
  // Regra para Anos Iniciais do Fundamental
  else if (alocacao.turma.nivel === 'Anos Iniciais') {
    // Regra III.a: Professor Colaborativo
    const regraIII_a = professoresDisponiveis.filter(p => p.tipo === 'colaborativo');
    
    // Regra III.b: Coordenador de Gestão Pedagógica por Área de Conhecimento – Linguagens
    const regraIII_b = professoresDisponiveis.filter(p => p.tipo === 'coordenador' && p.areaConhecimento === todasAreas.LINGUAGENS);

    listaPriorizada = [
        { label: "Prioridade 1: Professor Colaborativo", opcoes: regraIII_a },
        { label: "Prioridade 2: Coordenação de Linguagens", opcoes: regraIII_b },
    ];
  }

  // Adiciona outros professores que não se encaixam nas regras, como última opção
  const todosPriorizadosIds = listaPriorizada.flatMap(grupo => grupo.opcoes.map(p => p.id));
  const outros = professoresDisponiveis.filter(p => !todosPriorizadosIds.includes(p.id));

  if (outros.length > 0) {
      listaPriorizada.push({ label: "Outras Opções", opcoes: outros });
  }

  return listaPriorizada.filter(grupo => grupo.opcoes.length > 0); // Remove grupos vazios
}

// --- COMPONENTE PRINCIPAL ---
export default function TelaSubstituicaoProfessor() {
  const [alocacoes, setAlocacoes] = useState(alocacoesIniciais);
  const [filtro, setFiltro] = useState({ disciplinaId: '', professorId: '', turmaId: '', data: '' });
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [showSubstituicaoModal, setShowSubstituicaoModal] = useState(false);
  const [aulaParaSubstituir, setAulaParaSubstituir] = useState(null);
  const [novoProfessorId, setNovoProfessorId] = useState('');
  const [modalConfig, setModalConfig] = useState({ show: false, title: "", message: "", onConfirm: () => {}, confirmVariant: "primary" });
  const [historicoAberto, setHistoricoAberto] = useState(null);

  const alocacoesFiltradas = useMemo(() => {
    if (!buscaRealizada) return [];
    
    return alocacoes.filter(aloc => {
      const matchDisciplina = !filtro.disciplinaId || aloc.disciplina.id === parseInt(filtro.disciplinaId);
      const matchProfessor = !filtro.professorId || aloc.professorAtual.id === parseInt(filtro.professorId);
      const matchTurma = !filtro.turmaId || aloc.turma.id === parseInt(filtro.turmaId);
      const matchData = !filtro.data || aloc.data === filtro.data;
      return matchDisciplina && matchProfessor && matchTurma && matchData;
    });
  }, [filtro, alocacoes, buscaRealizada]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prevFiltro => ({ ...prevFiltro, [name]: value }));
  };
  
  const handleBuscar = () => setBuscaRealizada(true);
  
  const handleLimparFiltros = () => {
    setFiltro({ disciplinaId: '', professorId: '', turmaId: '', data: '' });
    setBuscaRealizada(false);
  };

  const handleFecharModalSubstituicao = () => {
    setShowSubstituicaoModal(false);
    setAulaParaSubstituir(null);
  };
  
  const handleCloseConfirmModal = () => {
    setModalConfig({ ...modalConfig, show: false });
  };
  
  const executarSubstituicao = (professorAntigo, professorNovo) => {
    setAlocacoes(alocacoes.map(aloc => {
      if (aloc.id === aulaParaSubstituir.id) {
        const novoHistorico = { data: new Date(), professorAntigo, professorNovo };
        return {
          ...aloc,
          professorAtual: professorNovo,
          historicoSubstituicao: [...aloc.historicoSubstituicao, novoHistorico],
        };
      }
      return aloc;
    }));
    toast.success(`Substituição realizada com sucesso!`);
    handleFecharModalSubstituicao();
  };

  const handleConfirmarSubstituicao = () => {
    if (!novoProfessorId) {
      toast.warn('Por favor, selecione um professor substituto.');
      return;
    }
    
    const professorAntigo = aulaParaSubstituir.professorAtual;
    const professorNovo = todosProfessores.find(p => p.id === parseInt(novoProfessorId));
    
    setModalConfig({
        show: true,
        title: "Confirmar Substituição",
        message: `Deseja substituir ${professorAntigo.nome} por ${professorNovo.nome}?`,
        confirmVariant: 'primary',
        onConfirm: () => {
            executarSubstituicao(professorAntigo, professorNovo);
            handleCloseConfirmModal();
        }
    });
  };
  
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

   const [professoresPriorizados, setProfessoresPriorizados] = useState([]);
      const handleAbrirModalSubstituicao = (alocacao) => {
    setAulaParaSubstituir(alocacao);
    setNovoProfessorId('');
    
    // MODIFICADO: Chama a função de priorização e atualiza o estado
    const listaPriorizada = getProfessoresSubstitutosPriorizados(alocacao, todosProfessores);
    setProfessoresPriorizados(listaPriorizada);

    setShowSubstituicaoModal(true);
  };


  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Substituição de Professores</h2>
      <p className="text-center text-muted mb-5">
        Utilize os filtros para encontrar a aula e realize a troca de professores.
      </p>

      <Card className="shadow-sm p-4 mb-5">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Group><Form.Label>Data da Aula</Form.Label>
              <Form.Control type="date" name="data" value={filtro.data} onChange={handleFiltroChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Disciplina</Form.Label>
              <Form.Select name="disciplinaId" value={filtro.disciplinaId} onChange={handleFiltroChange}>
                <option value="">Todas</option>{todasDisciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group><Form.Label>Turma</Form.Label>
              <Form.Select name="turmaId" value={filtro.turmaId} onChange={handleFiltroChange}>
                <option value="">Todas</option>{todasTurmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex gap-2">
            <Button variant="primary" onClick={handleBuscar} className="w-100"><i className="bi bi-search me-1"></i>Buscar</Button>
            <Button variant="outline-secondary" onClick={handleLimparFiltros} className="w-100"><i className="bi bi-eraser me-1"></i>Limpar</Button>
          </Col>
        </Row>
      </Card>

      {buscaRealizada && (
        <AnimatePresence>
          {alocacoesFiltradas.length > 0 ? (
            alocacoesFiltradas.map((aloc, i) => (
              <motion.div key={aloc.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                        <div className="fw-bold fs-5">{aloc.horario}</div>
                        <div className="text-muted">{dayjs(aloc.data).format('DD/MM')}</div>
                      </Col>
                      <Col xs={12} md={7}>
                        <h5>{aloc.disciplina.nome}</h5>
                        <p className="mb-1"><strong>Turma:</strong> {aloc.turma.nome}</p>
                        <p className="mb-0"><strong>Professor(a):</strong> <Badge bg="primary">{aloc.professorAtual.nome}</Badge></p>
                      </Col>
                      <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0 d-flex flex-column align-items-end">
                        <Button variant="warning" onClick={() => handleAbrirModalSubstituicao(aloc)} className="w-100 mb-2">
                          <i className="bi bi-arrow-repeat me-2"></i>Substituir
                        </Button>
                        {aloc.historicoSubstituicao.length > 0 && (
                          <Button variant="outline-info" size="sm" className="w-100" onClick={() => setHistoricoAberto(historicoAberto === aloc.id ? null : aloc.id)}>
                            <i className="bi bi-clock-history me-1"></i> Ver Histórico
                          </Button>
                        )}
                      </Col>
                    </Row>
                    <Collapse in={historicoAberto === aloc.id}>
                      <div>
                        <hr/>
                        <div className="mt-2">
                          <h6>Histórico de Trocas:</h6>
                          <ListGroup variant="flush" className="mt-1">
                            {aloc.historicoSubstituicao.map((hist, index) => (
                              <ListGroup.Item key={index} className="px-0">
                                <small className="text-muted">
                                  Em {new Date(hist.data).toLocaleString('pt-BR')}:<br/>
                                  <span className="text-danger">{hist.professorAntigo.nome}</span> {' -> '}
                                  <span className="text-success">{hist.professorNovo.nome}</span>
                                </small>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              </motion.div>
            ))
          ) : (
            <Col className="text-center text-muted mt-4">
              <h4>Nenhuma aula encontrada</h4>
              <p>Tente ajustar os filtros ou clique em "Limpar" para recomeçar.</p>
            </Col>
          )}
        </AnimatePresence>
      )}

      {aulaParaSubstituir && (
        <Modal show={showSubstituicaoModal} onHide={handleFecharModalSubstituicao} centered>
          <Modal.Header closeButton><Modal.Title>Substituir Professor</Modal.Title></Modal.Header>
          <Modal.Body>
            <p><strong>Disciplina:</strong> {aulaParaSubstituir.disciplina.nome}</p>
            <p><strong>Turma:</strong> {aulaParaSubstituir.turma.nome}</p>
            <p><strong>Professor(a) Atual:</strong> {aulaParaSubstituir.professorAtual.nome}</p>
            <hr />
            <Form.Group>
              <Form.Label className="fw-bold">Selecione o(a) novo(a) professor(a):</Form.Label>
              <Form.Select value={novoProfessorId} onChange={(e) => setNovoProfessorId(e.target.value)}>
                <option value="">Selecione...</option>
                {professoresPriorizados.map(grupo => (
                  <optgroup label={grupo.label} key={grupo.label}>
                    {grupo.opcoes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.cargaHoraria}h - {p.areaConhecimento})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalSubstituicao}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmarSubstituicao}>Confirmar Substituição</Button>
          </Modal.Footer>
        </Modal>
      )}
      
      <ModalConfirmacao
        show={modalConfig.show}
        onHide={handleCloseConfirmModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmVariant={modalConfig.confirmVariant}
      />
    </Container>
  );
}