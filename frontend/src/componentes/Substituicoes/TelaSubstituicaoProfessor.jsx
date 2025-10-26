import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, ListGroup, Collapse, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ModalConfirmacao from '../ModaisUteis/ModalConfirmação';
import dayjs from 'dayjs';
import axios from 'axios';
import TurmaService from '../../services/Turma';       // Ajuste o caminho se necessário
import DisciplinaService from '../../services/Disciplina'; // Ajuste o caminho se necessário

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', 
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
}, error => Promise.reject(error));

function getProfessoresSubstitutosPriorizados(alocacao, todosOsProfessores) {
  console.log("==================================================");
  console.log("======= INICIANDO ANÁLISE DE PRIORIZAÇÃO =======");
  console.log("==================================================");

  // --- 1. DADOS DE ENTRADA ---
  console.log("Dados da Aula (alocacao):", alocacao);
  console.log("Lista de Todos os Professores (todosOsProfessores):", todosOsProfessores);

  const professorAtualId = alocacao.professorAtual.id;
  const areaDaAula = alocacao.disciplina.areaConhecimento;
  const nivelDaTurma = alocacao.turma.nivel;

  console.log(`\n--- 2. PARÂMETROS EXTRAÍDOS ---`);
  console.log(`ID do Professor Atual: ${professorAtualId}`);
  console.log(`Área da Aula: "${areaDaAula}"`);
  console.log(`Nível da Turma: "${nivelDaTurma}"`);

  const professoresDisponiveis = todosOsProfessores.filter(p => p.id !== professorAtualId);
  console.log("\n--- 3. PROFESSORES DISPONÍVEIS (após remover o atual) ---", professoresDisponiveis);

  let listaPriorizada = [];

  if (nivelDaTurma === 'Anos Finais') {
    console.log("\n--- 4. APLICANDO REGRAS PARA 'ANOS FINAIS' ---");

    // --- REGRA II.a ---
    console.log("\n--- Verificando Regra II.a (Docentes da mesma área) ---");
    const regraII_a = professoresDisponiveis.filter(p => {
      const condTipo = p.tipo === 'docente';
      const condArea = p.areaConhecimento === areaDaAula;
      console.log(`- ${p.nome}: tipo é 'docente'? ${condTipo}. área é '${areaDaAula}'? ${condArea}.`);
      return condTipo && condArea;
    }).sort((a, b) => a.cargaHoraria - b.cargaHoraria);
    console.log("Resultado Regra II.a:", regraII_a);

    // --- REGRA II.b ---
    console.log("\n--- Verificando Regra II.b (Docentes de outras áreas) ---");
    const regraII_b = professoresDisponiveis.filter(p => {
        const condTipo = p.tipo === 'docente';
        const condArea = p.areaConhecimento !== areaDaAula;
        console.log(`- ${p.nome}: tipo é 'docente'? ${condTipo}. área é diferente de '${areaDaAula}'? ${condArea}.`);
        return condTipo && condArea;
    }).sort((a, b) => a.cargaHoraria - b.cargaHoraria);
    console.log("Resultado Regra II.b:", regraII_b);
    
    // --- REGRA II.c ---
    console.log("\n--- Verificando Regra II.c (Coordenadores da mesma área) ---");
    const regraII_c = professoresDisponiveis.filter(p => {
        const condTipo = p.tipo === 'coordenador';
        const condArea = p.areaConhecimento === areaDaAula;
        console.log(`- ${p.nome}: tipo é 'coordenador'? ${condTipo}. área é '${areaDaAula}'? ${condArea}.`);
        return condTipo && condArea;
    });
    console.log("Resultado Regra II.c:", regraII_c);

    // --- REGRA II.d ---
    console.log("\n--- Verificando Regra II.d (Todos os Coordenadores) ---");
    const regraII_d = professoresDisponiveis.filter(p => {
        const condTipo = p.tipo === 'coordenador';
        console.log(`- ${p.nome}: tipo é 'coordenador'? ${condTipo}.`);
        return condTipo;
    }).sort((a, b) => a.cargaHoraria - b.cargaHoraria);
    console.log("Resultado Regra II.d:", regraII_d);
    
    listaPriorizada = [
        { label: "Prioridade 1: Docentes da mesma área", opcoes: regraII_a },
        { label: "Prioridade 2: Docentes de outras áreas", opcoes: regraII_b },
        { label: "Prioridade 3: Coordenadores", opcoes: [...new Set([...regraII_c, ...regraII_d])] }
    ];

  } else if (nivelDaTurma === 'Anos Iniciais') {
    console.log("\n--- 4. APLICANDO REGRAS PARA 'ANOS INICIAIS' ---");
    // Adicione logs aqui se precisar depurar este bloco também
    const regraIII_a = professoresDisponiveis.filter(p => p.tipo === 'colaborativo');
    const regraIII_b = professoresDisponiveis.filter(p => p.tipo === 'coordenador' && p.areaConhecimento === 'Linguagens');
    listaPriorizada = [
        { label: "Prioridade 1: Professor Colaborativo", opcoes: regraIII_a },
        { label: "Prioridade 2: Coordenação de Linguagens", opcoes: regraIII_b },
    ];
  }

  // --- Outras Opções ---
  console.log("\n--- 5. CALCULANDO 'OUTRAS OPÇÕES' ---");
  const todosPriorizadosIds = listaPriorizada.flatMap(grupo => grupo.opcoes.map(p => p.id));
  const outros = professoresDisponiveis.filter(p => !todosPriorizadosIds.includes(p.id));
  console.log("Professores que não se encaixaram em nenhuma regra:", outros);

  if (outros.length > 0) {
    listaPriorizada.push({ label: "Outras Opções", opcoes: outros });
  }

  console.log("\n--- 6. LISTA FINAL ANTES DE FILTRAR GRUPOS VAZIOS ---");
  console.log(listaPriorizada);
  console.log("==================================================");
  console.log("========= FIM DA ANÁLISE DE PRIORIZAÇÃO =========");
  console.log("==================================================");

  return listaPriorizada.filter(grupo => grupo.opcoes.length > 0);
}

export default function TelaSubstituicaoProfessor() {
    const [alocacoes, setAlocacoes] = useState([]);
    const [todosProfessoresDB, setTodosProfessoresDB] = useState([]); 
    const [disciplinasFiltro, setDisciplinasFiltro] = useState([]);
    const [turmasFiltro, setTurmasFiltro] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState({ disciplinaId: '', professorId: '', turmaId: '', data: '' });
    const [buscaRealizada, setBuscaRealizada] = useState(false);
    const [showSubstituicaoModal, setShowSubstituicaoModal] = useState(false);
    const [aulaParaSubstituir, setAulaParaSubstituir] = useState(null);
    const [novoProfessorId, setNovoProfessorId] = useState('');
    const [modalConfig, setModalConfig] = useState({ show: false, title: "", message: "", onConfirm: () => {}, confirmVariant: "primary" });
    const [historicoAberto, setHistoricoAberto] = useState(null);
    const [professoresPriorizados, setProfessoresPriorizados] = useState([]);
    
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const [professoresData, turmasData, disciplinasData] = await Promise.all([
                    apiClient.get('/professor/professores'),
                    TurmaService.findAll(),
                    DisciplinaService.findAll()
                ]);

                setTodosProfessoresDB(professoresData.data || []);
                setTurmasFiltro(Array.isArray(turmasData) ? turmasData : []);
                setDisciplinasFiltro(Array.isArray(disciplinasData) ? disciplinasData : []);

            } catch (err) {
                toast.error("Falha ao carregar dados dos filtros.");
            }
        };
        carregarDadosIniciais();
    }, []);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltro(prevFiltro => ({ ...prevFiltro, [name]: value }));
    };

    const handleBuscar = async () => {
        setIsLoading(true);
        setError(null);
        setBuscaRealizada(true);
        try {
            const disciplinaSelecionada = disciplinasFiltro.find(d => d.id === parseInt(filtro.disciplinaId));
            const params = {
                data: filtro.data || null,
                id_turma: filtro.turmaId || null,
                id_professor: filtro.professorId || null,
                disciplinaNome: disciplinaSelecionada ? disciplinaSelecionada.nome : null,
            };
            Object.keys(params).forEach(key => params[key] == null && delete params[key]);
            const response = await apiClient.get('/substituicoes/agendamentos', { params });
            setAlocacoes(response.data);
        } catch (err) {
            setError("Não foi possível buscar as aulas.");
            toast.error(err.response?.data?.message || "Erro ao buscar aulas.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLimparFiltros = () => {
        setFiltro({ disciplinaId: '', professorId: '', turmaId: '', data: '' });
        setAlocacoes([]);
        setBuscaRealizada(false);
        setError(null);
    };

    const executarSubstituicao = async () => {
        try {
            const payload = {
                id_agendamento_aula: aulaParaSubstituir.id,
                id_professor_anterior: aulaParaSubstituir.professor_id,
                id_professor_novo: parseInt(novoProfessorId),
                motivo: null
            };
            await apiClient.post('/substituicoes/substituir', payload);
            toast.success(`Substituição realizada com sucesso!`);
            handleFecharModalSubstituicao();
            await handleBuscar();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao salvar a substituição.');
        }
    };

    const prosseguirParaConfirmacaoFinal = () => {
        const professorNovo = todosProfessoresDB.find(p => p.id === parseInt(novoProfessorId));
        if (!professorNovo) {
            toast.error("Professor selecionado não encontrado. Tente recarregar a página.");
            return;
        }
        // Mostra o modal final ("Deseja substituir X por Y?")
        setModalConfig({
            show: true,
            title: "Confirmar Substituição",
            message: `Deseja substituir ${aulaParaSubstituir.professor_nome} por ${professorNovo.nome}?`,
            confirmVariant: 'primary',
            onConfirm: () => {
                executarSubstituicao(); // Chama a função que salva no backend
                handleCloseConfirmModal();
            }
        });
    }

   const handleConfirmarSubstituicao = () => {
        // 1. Validação inicial (já existia)
        if (!novoProfessorId) {
            toast.warn('Por favor, selecione um professor substituto.');
            return;
        }

        // 2. Verifica a data da aula
        const dataAula = dayjs(aulaParaSubstituir.start);
        const hoje = dayjs().startOf('day'); // Pega o início do dia atual

        if (dataAula.isBefore(hoje)) {
            // 3. Se a data for passada, mostra o aviso de substituição retroativa
            setModalConfig({
                show: true,
                title: "Atenção: Substituição Retroativa",
                message: "Esta aula já ocorreu. Deseja realmente registrar essa substituição retroativa?",
                confirmVariant: 'warning', // Usamos warning para destacar
                onConfirm: () => {
                    // Se o usuário confirmar o aviso, chamamos a função para mostrar o modal final
                    prosseguirParaConfirmacaoFinal(); 
                }
            });
        } else {
            // 4. Se a data for hoje ou futura, vai direto para o modal de confirmação final
            prosseguirParaConfirmacaoFinal();
        }
    };

    const handleVerHistorico = async (alocId) => {
        if (historicoAberto === alocId) {
            setHistoricoAberto(null);
            return;
        }
        try {
            const response = await apiClient.get(`/substituicoes/historico/${alocId}`);
            setAlocacoes(alocacoesAtuais =>
                alocacoesAtuais.map(aloc =>
                    aloc.id === alocId ? { ...aloc, historicoSubstituicao: response.data } : aloc
                )
            );
            setHistoricoAberto(alocId);
        } catch (err) {
            toast.error("Falha ao carregar o histórico.");
        }
    };

    const handleFecharModalSubstituicao = () => {
        setShowSubstituicaoModal(false);
        setAulaParaSubstituir(null);
    };

    const handleAbrirModalSubstituicao = (alocacao) => {
        const disciplinaCompleta = disciplinasFiltro.find(d => d.nome === alocacao.disciplina_nome) || {};
        const turmaCompleta = turmasFiltro.find(t => t.id === alocacao.turma_id) || {};
        const alocacaoAdaptada = {
            ...alocacao,
            professorAtual: { id: alocacao.professor_id, nome: alocacao.professor_nome },
            disciplina: { nome: alocacao.disciplina_nome, areaConhecimento: disciplinaCompleta.areaConhecimento },
            turma: { nome: alocacao.turma_nome, nivel: turmaCompleta.nivel }
        }
        setAulaParaSubstituir(alocacao);
        setNovoProfessorId('');
        const listaPriorizada = getProfessoresSubstitutosPriorizados(alocacaoAdaptada, todosProfessoresDB);
        setProfessoresPriorizados(listaPriorizada);
        setShowSubstituicaoModal(true);
    };

    const handleCloseConfirmModal = () => setModalConfig({ ...modalConfig, show: false });

    return (
        <Container className="py-5">
            <h2 className="text-center mb-4">Substituição de Professores</h2>
            <Card className="shadow-sm p-4 mb-5">
                <Row className="g-3 align-items-end">
                    <Col md={2}>
                        <Form.Group><Form.Label>Data da Aula</Form.Label>
                        <Form.Control type="date" name="data" value={filtro.data} onChange={handleFiltroChange} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group><Form.Label>Disciplina</Form.Label>
                        <Form.Select name="disciplinaId" value={filtro.disciplinaId} onChange={handleFiltroChange}>
                            <option value="">Todas</option>{disciplinasFiltro.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                        </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group><Form.Label>Turma</Form.Label>
                        <Form.Select name="turmaId" value={filtro.turmaId} onChange={handleFiltroChange}>
                            <option value="">Todas</option>{turmasFiltro.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group><Form.Label>Professor</Form.Label>
                        <Form.Select name="professorId" value={filtro.professorId} onChange={handleFiltroChange}>
                            <option value="">Todos</option>{todosProfessoresDB.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                        <Button variant="primary" onClick={handleBuscar} className="w-100">Buscar</Button>
                        <Button variant="outline-secondary" onClick={handleLimparFiltros} className="w-100">Limpar</Button>
                    </Col>
                </Row>
            </Card>
            
            {isLoading && <div className="text-center"><Spinner animation="border" variant="primary" /> <p>Buscando aulas...</p></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!isLoading && !error && buscaRealizada && (
                <AnimatePresence>
                {alocacoes.length > 0 ? (
                    alocacoes.map((aloc) => (
                    <motion.div key={aloc.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="mb-3 shadow-sm">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                                    <div className="fw-bold fs-5">{dayjs(aloc.start).format('HH:mm')} - {dayjs(aloc.end).format('HH:mm')}</div>
                                    <div className="text-muted">{dayjs(aloc.start).format('DD/MM/YYYY')}</div>
                                </Col>
                                <Col xs={12} md={7}>
                                    <h5>{aloc.disciplina_nome}</h5>
                                    <p className="mb-1"><strong>Turma:</strong> {aloc.turma_nome}</p>
                                    <p className="mb-0"><strong>Professor(a):</strong> <Badge bg="primary">{aloc.professor_nome}</Badge></p>
                                </Col>
                                <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0 d-flex flex-column align-items-end">
                                    <Button variant="warning" onClick={() => handleAbrirModalSubstituicao(aloc)} className="w-100 mb-2">
                                        <i className="bi bi-arrow-repeat me-2"></i>Substituir
                                    </Button>
                                    <Button variant="outline-info" size="sm" className="w-100" onClick={() => handleVerHistorico(aloc.id)}>
                                        <i className="bi bi-clock-history me-1"></i> 
                                        {historicoAberto === aloc.id ? 'Fechar Histórico' : 'Ver Histórico'}
                                    </Button>
                                </Col>
                            </Row>
                            <Collapse in={historicoAberto === aloc.id}>
                                <div>
                                    <hr/>
                                    <h6>Histórico de Trocas:</h6>
                                    {aloc.historicoSubstituicao && aloc.historicoSubstituicao.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {aloc.historicoSubstituicao.map((hist) => (
                                        <ListGroup.Item key={hist.id} className="px-0">
                                            <small className="text-muted">
                                                Em {dayjs(hist.data_substituicao).format('DD/MM/YYYY [às] HH:mm')}:<br/>
                                                <span className="text-danger">{hist.professor_anterior_nome}</span> {' -> '}
                                                <span className="text-success">{hist.professor_novo_nome}</span>
                                                {hist.usuario_responsavel_nome && <><br/><span className="text-info">Operador: {hist.usuario_responsavel_nome}</span></>}
                                            </small>
                                        </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    ) : (
                                        <p className='text-muted small mt-2'>Nenhuma substituição anterior para esta aula.</p>
                                    )}
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
                        <p><strong>Disciplina:</strong> {aulaParaSubstituir.disciplina_nome}</p>
                        <p><strong>Turma:</strong> {aulaParaSubstituir.turma_nome}</p>
                        <p><strong>Professor(a) Atual:</strong> {aulaParaSubstituir.professor_nome}</p>
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