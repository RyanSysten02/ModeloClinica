import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Container, Row, Col, Card, Button, Table, Form, Spinner, Collapse, Dropdown, Badge,
  Modal,
  Alert, 
  OverlayTrigger, 
  Tooltip,
  ListGroup,
} from "react-bootstrap";
// Import AnimatePresence e motion
import { motion, AnimatePresence } from "framer-motion"; 
import { toast } from "react-toastify";
import TurmaService from "../../services/Turma";
import DisciplinaService from "../../services/Disciplina";

// --- Função auxiliar: salvarStatusNotificacao ---
const salvarStatusNotificacao = async (alunos, novoStatus) => {
  const alunosArray = Array.isArray(alunos) ? alunos : [alunos];
  if (alunosArray.length === 0) return;
  try {
    const token = localStorage.getItem("token");
    const frequencia_ids = alunosArray.map(aluno => aluno.frequencia_id);
    const response = await fetch('http://localhost:5001/api/frequencia/notificacao', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ frequencia_ids, status: novoStatus })
    });
    if (!response.ok) {
      toast.error("Erro ao salvar o status da notificação no servidor.");
    }
  } catch (error) {
    toast.error("Falha de conexão ao salvar o status da notificação.");
  }
};

// --- Função auxiliar: getStatusVariant ---
const getStatusVariant = (status) => {
  if (status?.includes('whatsapp')) return 'success';
  if (status?.includes('email')) return 'info';
  if (status === 'ignorado') return 'secondary'; 
  return 'warning';
};

// --- Componente: CustomToggle (Ícone de Engrenagem) ---
const CustomToggle = React.forwardRef(({ children, onClick, disabled }, ref) => (
  <Button
    variant="outline-secondary"
    href=""
    ref={ref}
    disabled={disabled}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    title="Alterar status manualmente"
    className="d-flex align-items-center"
  >
    <i className="bi bi-gear-fill"></i>
  </Button>
));


// --- Componente Principal ---
export default function TelaNotificacaoFaltas() {
  // --- Estados de Dados e Filtros ---
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [alunosAusentes, setAlunosAusentes] = useState([]);
  
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [filtroDataFim, setFiltroDataFim] = useState(new Date().toISOString().split("T")[0]);
  const [filtroNome, setFiltroNome] = useState("");

  // --- Estados de UI ---
  const [loading, setLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [selecionados, setSelecionados] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // --- Estados da Fila Manual ---
  const [filaNotificacao, setFilaNotificacao] = useState([]);
  const [showFilaModal, setShowFilaModal] = useState(false);
  
  // --- MODIFICADO: Usando índice para a fila ---
  const [indiceFila, setIndiceFila] = useState(0); 
  
  const [isSaving, setIsSaving] = useState(false); 
  const [mensagemAtual, setMensagemAtual] = useState("");


  // --- Configuração das Animações ---
  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // --- NOVO: Variantes para a animação do conteúdo do modal ---
  const modalContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

   // --- NOVOS ESTADOS PARA O MODAL DE RESULTADOS DE EMAIL ---
const [showEmailStatusModal, setShowEmailStatusModal] = useState(false);
  const [emailStatusList, setEmailStatusList] = useState([]); 
  const [isSendingEmail, setIsSendingEmail] = useState(false); 

  // --- NOVOS ESTADOS PARA O COUNTDOWN ---
  const [countdown, setCountdown] = useState(5);
  const [showCancelCountdown, setShowCancelCountdown] = useState(false);
  const cancelTimerRef = useRef(null); // Para guardar a referência do timer
 
  // --- Efeito: Carregar dados iniciais ---
  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        const turmasData = await TurmaService.findAll();
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
        const disciplinasData = await DisciplinaService.findAll();
        setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
      } catch (error) {
        toast.error("Erro ao carregar dados iniciais (turmas ou disciplinas).");
      }
    };
    fetchDadosIniciais();
  }, []);

  // --- Memo: Alunos Filtrados (para busca por nome) ---
  const alunosFiltrados = useMemo(() => {
    if (!filtroNome) return alunosAusentes;
    return alunosAusentes.filter(aluno => 
      aluno.aluno_nome.toLowerCase().includes(filtroNome.toLowerCase())
    );
  }, [alunosAusentes, filtroNome]);

  // --- Efeito: Lógica do "Selecionar Todos" ---
  useEffect(() => {
    if (alunosFiltrados.length > 0) {
      const allVisibleSelected = alunosFiltrados.every(
        a => selecionados[a.frequencia_id]
      );
      setSelectAll(allVisibleSelected);
    } else {
      setSelectAll(false);
    }
  }, [selecionados, alunosFiltrados]);


  // --- Helper: Copiar texto ---
  const copyToClipboard = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage || "Copiado para a área de transferência!");
    } catch (err) {
      toast.error("Falha ao copiar texto.");
    }
  };

  // --- Helper: Gerar a URL e a Mensagem ---
  const gerarMensagemWhatsApp = (aluno) => {
    if (!aluno) return { url: null, text: "" };

    const telefone = aluno.responsavel_celular?.replace(/\D/g, '');
    
    const dataFormatada = filtroDataInicio === filtroDataFim
      ? `na data de ${new Date(aluno.data_aula + 'T00:00:00').toLocaleDateString('pt-BR')}`
      : `referente a falta do dia ${new Date(aluno.data_aula + 'T00:00:00').toLocaleDateString('pt-BR')}`;
      
    const text = `Prezado(a) ${aluno.responsavel_nome}, informamos que o(a) aluno(a) ${aluno.aluno_nome} faltou a aula de ${aluno.disciplina_nome} ${dataFormatada}. Por favor, entre em contato com a escola.`;
    
    const url = telefone ? `https://wa.me/55${telefone}?text=${encodeURIComponent(text)}` : null;

    return { url, text };
  };


  // --- Ação: "Selecionar Todos" Checkbox ---
  const handleSelectAll = (e) => { 
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelecionados(prev => {
      const newSelection = { ...prev };
      if (isChecked) {
        alunosFiltrados.forEach(a => newSelection[a.frequencia_id] = true);
      } else {
        alunosFiltrados.forEach(a => delete newSelection[a.frequencia_id]);
      }
      return newSelection;
    });
  };

  // --- Ação: Checkbox individual ---
  const toggleSelecionado = (id) => { 
    setSelecionados(prev => {
      const newSelection = { ...prev };
      if (newSelection[id]) {
        delete newSelection[id];
      } else {
        newSelection[id] = true;
      }
      return newSelection;
    });
  };

  // --- Ação: Buscar Ausentes ---
  const handleBuscarAusentes = async () => { 
    if (!filtroTurma || !filtroDataInicio || !filtroDataFim) {
      toast.warn("Selecione pelo menos a turma e o período.");
      return;
    }
    setLoading(true);
    setBuscaRealizada(false);
    setAlunosAusentes([]);
    setFiltroNome("");
    try {
      const token = localStorage.getItem("token");
      const startDate = new Date(filtroDataInicio);
      const endDate = new Date(filtroDataFim);
      const dias = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dias.push(new Date(d).toISOString().split("T")[0]);
      }
      const responses = await Promise.all(
        dias.map(async (data) => {
          const url = new URL(`http://localhost:5001/api/frequencia/ausentes`);
          url.searchParams.append("data_aula", data);
          url.searchParams.append("turma_id", filtroTurma);
          if (filtroDisciplina) {
            url.searchParams.append("disciplina_id", filtroDisciplina);
          }
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const json = await res.json();
            return json.map((a) => ({ ...a, data_aula: data }));
          }
          return [];
        })
      );
      const todos = responses.flat();
      const unicos = [];
      const vistos = new Set();
      for (const aluno of todos) {
        if (!vistos.has(aluno.frequencia_id)) {
          vistos.add(aluno.frequencia_id);
          unicos.push(aluno);
        }
      }
      unicos.sort((a, b) => new Date(b.data_aula) - new Date(a.data_aula));
      setAlunosAusentes(unicos);
    } catch (error) {
      toast.error("Erro ao buscar ausentes: " + error.message);
    } finally {
      setLoading(false);
      setBuscaRealizada(true);
      setSelecionados({});
      setSelectAll(false);
    }
  };

  // --- Ação: Get Selecionados ---
  const getSelecionados = () => alunosAusentes.filter(a => selecionados[a.frequencia_id]);

  // --- Ação: Alterar Status Manualmente (Dropdown) ---
  const alterarStatusEmMassa = async (novoStatus) => { 
    const selecionadosList = getSelecionados();
    if (selecionadosList.length === 0) {
      toast.info("Selecione ao menos uma falta.");
      return;
    }
    await salvarStatusNotificacao(selecionadosList, novoStatus);
    setAlunosAusentes(prev =>
      prev.map(a => selecionados[a.frequencia_id] ? { ...a, notificacao_status: novoStatus } : a)
    );
    toast.success(`Status atualizado para ${novoStatus.replace("_", " ")}.`);
  };

  // --- Ação: Iniciar Fila WhatsApp ---
  const handleNotificarWhatsApp = () => {
    const paraNotificar = getSelecionados();
    if (paraNotificar.length === 0) {
      toast.info("Selecione ao menos uma falta para notificar.");
      return;
    }

    setFilaNotificacao(paraNotificar);
    setIndiceFila(0); // Reseta o índice
    setShowFilaModal(true);

    // Gera a mensagem para o primeiro aluno (índice 0)
    const { text } = gerarMensagemWhatsApp(paraNotificar[0]);
    setMensagemAtual(text);
  };

  // --- Ação: Enviar Notificação Atual (Modal) ---
  const handleEnviarNotificacaoAtual = () => {
    const alunoAtual = filaNotificacao[indiceFila]; // Usa o índice
    
    if (alunoAtual) {
      const { url } = gerarMensagemWhatsApp(alunoAtual);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error(`Aluno ${alunoAtual.aluno_nome} não possui celular cadastrado.`);
      }
    }
  };

  // --- Ação: Próximo da Fila (Modal) ---
  const handleProximoDaFila = async () => {
    if (isSaving) return;
    setIsSaving(true); 

    const alunoProcessado = filaNotificacao[indiceFila]; // Usa o índice
    if (!alunoProcessado) {
        setIsSaving(false); 
        return;
    }

    // Salva o status
    await salvarStatusNotificacao([alunoProcessado], 'notificado_whatsapp');
    setAlunosAusentes(prev =>
      prev.map(a => 
        a.frequencia_id === alunoProcessado.frequencia_id 
        ? { ...a, notificacao_status: 'notificado_whatsapp' } 
        : a
      )
    );
    toggleSelecionado(alunoProcessado.frequencia_id);

    const novoIndice = indiceFila + 1;

    // Verifica se ainda há alunos na fila
    if (novoIndice < filaNotificacao.length) {
      // Prepara o próximo aluno
      const proximoAluno = filaNotificacao[novoIndice];
      const { text } = gerarMensagemWhatsApp(proximoAluno);
      setMensagemAtual(text);
      setIndiceFila(novoIndice); // <-- Atualiza o índice
      setIsSaving(false);
    } else {
      // A fila acabou
      setShowFilaModal(false);
      toast.success("Notificações em fila concluídas!");
      setIsSaving(false); 
    }
  };

  // --- NOVO: Ação para Voltar ao Aluno Anterior ---
  const handleVoltarAoAnterior = () => {
    if (isSaving) return; 

    const novoIndice = indiceFila - 1;

    if (novoIndice >= 0) {
      const alunoAnterior = filaNotificacao[novoIndice];
      const { text } = gerarMensagemWhatsApp(alunoAnterior);
      setMensagemAtual(text);
      setIndiceFila(novoIndice); // <-- Atualiza o índice para voltar
    } else {
      toast.info("Você já está no primeiro aluno.");
    }
  };

  // --- Ação: Cancelar Fila (Modal) ---
  const handleCancelarFila = () => {
    setShowFilaModal(false);
    setFilaNotificacao([]);
    setIndiceFila(0); // Reseta o índice
    setMensagemAtual(""); // Limpa a mensagem
    setIsSaving(false);
    toast.info("Fila de notificação cancelada.");
  };

 // --- Ação: Notificar por E-mail (MODIFICADA COM COUNTDOWN) ---
  const handleNotificarEmail = async () => {
    const paraNotificar = getSelecionados();
    if (paraNotificar.length === 0) {
      toast.info("Selecione ao menos uma falta para notificar por e-mail.");
      return;
    }

    // 1. Preparar o estado inicial para o modal
    const initialStatusList = paraNotificar.map(aluno => ({
      frequencia_id: aluno.frequencia_id,
      aluno_nome: aluno.aluno_nome,
      responsavel_nome: aluno.responsavel_nome, // <-- Adicionado Responsável
      responsavel_email: aluno.responsavel_email,
      status: 'pending', // Status inicial antes do countdown
      erro: null
    }));
    setEmailStatusList(initialStatusList);
    setShowEmailStatusModal(true); // Abre o modal
    setCountdown(5); // Inicia contador
    setShowCancelCountdown(true); // Mostra seção de cancelamento
    setIsSendingEmail(false); // Garante que não está no modo "enviando" ainda

    // 2. Limpa qualquer timer anterior (segurança)
    if (cancelTimerRef.current) {
      clearInterval(cancelTimerRef.current);
    }

    // 3. Inicia o contador regressivo
    cancelTimerRef.current = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(cancelTimerRef.current); // Para o timer
          cancelTimerRef.current = null;
          setShowCancelCountdown(false); // Esconde botão cancelar
          startEmailSendingProcess(paraNotificar); // Inicia o envio REAL
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000); // Executa a cada 1 segundo
  };

  // --- NOVA FUNÇÃO: Inicia o envio real após o countdown ---
  const startEmailSendingProcess = async (paraNotificar) => {
    setIsSendingEmail(true); // Agora sim, está enviando
    toast.info(`Iniciando envio de ${paraNotificar.length} e-mail(s)...`);
    
    // Marca todos como 'sending' visualmente no modal
    setEmailStatusList(prevList => prevList.map(item => ({ ...item, status: 'sending' }))); 

    try {
      const token = localStorage.getItem("token");
      const frequencia_ids = paraNotificar.map(a => a.frequencia_id);

      const res = await fetch('http://localhost:5001/api/notificacao/email-em-massa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ frequencia_ids })
      });

      const data = await res.json();

      // Processa a resposta e atualiza o modal (lógica movida para cá)
      if (res.ok) {
        toast.success(data.message || "Processamento de e-mails concluído!");

        const idsSucesso = data.sucesso?.map(item => item.id) || [];
        const falhasMap = new Map(data.falha?.map(item => [item.id, item.erro]));

        setEmailStatusList(prevList => prevList.map(item => {
          if (idsSucesso.includes(item.frequencia_id)) {
            return { ...item, status: 'success' };
          } else {
            const erro = falhasMap.get(item.frequencia_id);
            // Se não estava na lista de sucesso nem falha (improvável), marca como falha
            return { ...item, status: 'failure', erro: erro || 'Status não retornado pelo servidor' };
          }
        }));

        // Atualiza a tabela principal
        if (idsSucesso.length > 0) {
            setAlunosAusentes(prev =>
                prev.map(a =>
                    idsSucesso.includes(a.frequencia_id)
                    ? { ...a, notificacao_status: 'notificado_email' }
                    : a
                )
            );
            setSelecionados(prev => {
                const newSelection = {...prev};
                idsSucesso.forEach(id => delete newSelection[id]);
                return newSelection;
            });
        }

      } else {
        toast.error(data.message || "Falha grave ao processar envio de e-mails.");
        setEmailStatusList(prevList => prevList.map(item => ({
             ...item, status: 'failure', erro: data.message || "Erro na comunicação com o servidor"
        })));
      }

    } catch (error) {
      toast.error("Erro de conexão ao enviar e-mails.");
       setEmailStatusList(prevList => prevList.map(item => ({
             ...item, status: 'failure', erro: "Erro de conexão"
        })));
    } finally {
      setIsSendingEmail(false); // Envio terminou (ou falhou)
    }
  };

  // --- NOVA FUNÇÃO: Cancela o envio durante o countdown ---
  const handleCancelSending = () => {
    if (cancelTimerRef.current) {
      clearInterval(cancelTimerRef.current);
      cancelTimerRef.current = null; // <-- Adicione esta linha
    }
    setShowEmailStatusModal(false); // Fecha o modal
    // Reseta os estados
    setEmailStatusList([]);
    setCountdown(5);
    setShowCancelCountdown(false);
    setIsSendingEmail(false);
    // cancelTimerRef.current = null; // Já limpamos acima
    toast.warn("Envio de e-mails cancelado pelo usuário.");
  };

  
  const numSelecionados = Object.values(selecionados).filter(Boolean).length;

  // --- Efeito para limpar o timer ---
  useEffect(() => {
    // Esta função será executada quando o componente for desmontado
    return () => {
      if (cancelTimerRef.current) {
        clearInterval(cancelTimerRef.current);
        cancelTimerRef.current = null; // Limpa a referência também
      }
    };
  }, []); // O array vazio [] garante que isso só rode na montagem e desmontagem

  // --- Renderização ---
  return (
    <Container className="py-5">
      <motion.div initial="hidden" animate="visible" variants={animationVariants}>
        
        <h2 className="text-center mb-4">Notificar Ausências de Alunos</h2>

        {/* --- Card de Filtros --- */}
        <Card className="shadow-sm p-4 mb-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Turma (*)</Form.Label>
              <Form.Select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}>
                <option value="">Selecione a Turma</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Disciplina</Form.Label>
              <Form.Select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)}>
                <option value="">Todas</option>
                {disciplinas.map(d => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Data Inicial (*)</Form.Label>
              <Form.Control type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
            </Col>
            <Col md={2}>
              <Form.Label>Data Final (*)</Form.Label>
              <Form.Control type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
            </Col>
            <Col md={1}>
              <Button 
                variant="primary" 
                onClick={handleBuscarAusentes} 
                className="w-100"
                disabled={loading}
                title="Buscar Faltas"
              >
                {loading ? <Spinner size="sm" animation="border" /> : <i className="bi bi-search"></i>}
              </Button>
            </Col>
          </Row>

          {/* --- Ações (WhatsApp, Email, Config) --- */}
          <Collapse in={buscaRealizada && alunosAusentes.length > 0}>
            <div className="mt-4 pt-3 border-top">
              <Row className="align-items-center">
                <Col md={5} lg={6}>
                  <strong>{numSelecionados} falta(s) selecionada(s)</strong>
                </Col>
                <Col md={7} lg={6} className="d-flex gap-2 justify-content-md-end">
                  <Button variant="success" onClick={handleNotificarWhatsApp} disabled={numSelecionados === 0}>
                    <i className="bi bi-whatsapp me-2"></i>Notificar via WhatsApp
                  </Button>
                  <Button variant="info" onClick={handleNotificarEmail} disabled={numSelecionados === 0}>
                    <i className="bi bi-envelope me-2"></i>Notificar via E-mail
                  </Button>
                  <Dropdown onSelect={(status) => alterarStatusEmMassa(status)}>
                    <Dropdown.Toggle 
                      as={CustomToggle}
                      id="dropdown-custom-options" 
                      disabled={numSelecionados === 0}
                    />
                    <Dropdown.Menu>
                      <Dropdown.Header>Alterar status manualmente</Dropdown.Header>
                      <Dropdown.Item eventKey="pendente">Marcar como Pendente</Dropdown.Item>
                      <Dropdown.Item eventKey="notificado_whatsapp">Marcar como Notif. WhatsApp</Dropdown.Item>
                      <Dropdown.Item eventKey="notificado_email">Marcar como Notif. E-mail</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </div>
          </Collapse>
        </Card>

        {/* --- Card de Resultados e Tabela --- */}
        <AnimatePresence>
          {buscaRealizada && (
            <motion.div key="resultados" variants={animationVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
                  <span className="fw-bold">Resultados da Busca</span>
                  {alunosAusentes.length > 0 && (
                    <Form.Control
                      type="text"
                      placeholder="Filtrar por nome do aluno..."
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                      style={{ width: '300px' }}
                      className="mt-2 mt-md-0"
                    />
                  )}
                </Card.Header>
                <Card.Body>
                  {loading ? ( 
                    <div className="text-center"><Spinner animation="border" /></div> 
                  ) : alunosAusentes.length === 0 ? ( 
                    <div className="text-center text-muted p-4">Nenhuma falta encontrada para os filtros selecionados.</div> 
                  ) : alunosFiltrados.length === 0 ? ( 
                    <div className="text-center text-muted p-4">Nenhum aluno encontrado com o nome "<strong>{filtroNome}</strong>".</div> 
                  ) : (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}><Form.Check type="checkbox" title="Selecionar Todos Visíveis" checked={selectAll} onChange={handleSelectAll}/></th>
                          <th>Aluno</th>
                          <th>Responsável</th>
                          <th>Disciplina</th>
                          <th>Data da Falta</th>
                          <th>Contato</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunosFiltrados.map(aluno => (
                          <tr key={aluno.frequencia_id}>
                            <td><Form.Check type="checkbox" checked={!!selecionados[aluno.frequencia_id]} onChange={() => toggleSelecionado(aluno.frequencia_id)}/></td>
                            <td>{aluno.aluno_nome}</td>
                            <td>{aluno.responsavel_nome || <span className="text-muted">Não informado</span>}</td>
                            <td>{aluno.disciplina_nome || <span className="text-muted">N/A</span>}</td>
                            <td>{new Date(aluno.data_aula + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                            <td>{aluno.responsavel_celular || aluno.responsavel_email || <span className="text-muted">Não informado</span>}</td>
                            <td className="text-center"><Badge bg={getStatusVariant(aluno.notificacao_status)}>{aluno.notificacao_status.replace(/_/g, " ")}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- MODAL DA FILA (COM ANIMAÇÃO) --- */}
      <Modal 
        show={showFilaModal} 
        onHide={handleCancelarFila} 
        backdrop="static"
        keyboard={false}
        centered
        size="lg" 
      >
        <Modal.Header closeButton>
          <Modal.Title>Fila de Notificação Manual</Modal.Title>
        </Modal.Header>
        
        {filaNotificacao.length > 0 && filaNotificacao[indiceFila] ? (
          <>
            <Modal.Body>
              
              <Alert variant="danger">
                <Alert.Heading as="h6">Atenção!</Alert.Heading>
                <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                  Realizar o envio de diversas notificações de whatsapp em um curto espaço de tempo, podem acarretar no bloqueio ou perca do numero de whatsapp.
                  <strong> Utilize a funcionalidade com moderação.</strong>
                </p>
              </Alert>

              <p className="text-muted">
                Clique em "Enviar Notificação" para abrir o WhatsApp, ou copie os dados abaixo para enviar manualmente.
              </p>
              
              {/* --- NOVO: Wrappers de Animação --- */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={indiceFila} // A chave única que dispara a animação
                  variants={modalContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <Card bg="light" className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <Card.Title className="mb-1">
                          {filaNotificacao[indiceFila].aluno_nome}
                        </Card.Title>
                        <Badge bg="primary" pill>
                          {indiceFila + 1} de {filaNotificacao.length}
                        </Badge>
                      </div>
                      <Card.Text>
                        <strong>Responsável:</strong> {filaNotificacao[indiceFila].responsavel_nome || <span className="text-danger">Não informado</span>}
                        <br/>
                        <strong>Contato:</strong> 
                        {filaNotificacao[indiceFila].responsavel_celular ? (
                          <>
                            {filaNotificacao[indiceFila].responsavel_celular}
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 ms-2"
                              title="Copiar número"
                              onClick={() => copyToClipboard(filaNotificacao[indiceFila].responsavel_celular.replace(/\D/g, ''), "Número copiado!")}
                            >
                              <i className="bi bi-clipboard-check"></i>
                            </Button>
                          </>
                        ) : (
                          <span className="text-danger">Sem celular cadastrado</span>
                        )}
                      </Card.Text>
                    </Card.Body>
                  </Card>

                  <Form.Group>
                    <Form.Label className="fw-bold">Mensagem a ser enviada:</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={4} 
                      value={mensagemAtual} 
                      readOnly 
                      style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }}
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => copyToClipboard(mensagemAtual, "Mensagem copiada!")}
                    >
                      <i className="bi bi-clipboard me-2"></i>
                      Copiar Mensagem
                    </Button>
                  </Form.Group>
                </motion.div>
              </AnimatePresence>
              {/* --- FIM: Wrappers de Animação --- */}

            </Modal.Body>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCancelarFila} className="me-auto" disabled={isSaving}>
                Cancelar Fila
              </Button>
              
              {/* --- NOVO: Botão Voltar --- */}
              <Button 
                variant="outline-secondary" 
                onClick={handleVoltarAoAnterior} 
                disabled={indiceFila === 0 || isSaving} // Desabilita no primeiro item
              >
                Voltar
              </Button>

              <Button variant="success" onClick={handleEnviarNotificacaoAtual} disabled={isSaving}>
                <i className="bi bi-whatsapp me-2"></i>
                Enviar Notificação
              </Button>

              <Button variant="primary" onClick={handleProximoDaFila} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    Salvando...
                  </>
                ) : (
                  // --- MODIFICADO: Muda o texto se for o último item ---
                  (indiceFila === filaNotificacao.length - 1) ? "Salvar e Concluir" : "Salvar e Próximo"
                )}
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <Modal.Body>
            <Spinner animation="border" size="sm" /> Carregando fila...
          </Modal.Body>
        )}
      </Modal>
      {/* --- MODAL DE STATUS DE ENVIO (COM COUNTDOWN E CANCELAMENTO) --- */}
      <Modal 
        show={showEmailStatusModal} 
        // Impede fechar enquanto conta ou envia
        onHide={() => !isSendingEmail && !showCancelCountdown && setShowEmailStatusModal(false)} 
        backdrop={(isSendingEmail || showCancelCountdown) ? 'static' : true} 
        keyboard={!(isSendingEmail || showCancelCountdown)}
        centered 
        size="lg" 
      >
        <Modal.Header closeButton={!(isSendingEmail || showCancelCountdown)}>
          <Modal.Title>
            {showCancelCountdown
              ? `Iniciando Envio em ${countdown}s...`
              : isSendingEmail
              ? "Enviando E-mails..." 
              : "Resultado do Envio de E-mails"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>

          {/* --- SEÇÃO DE CANCELAMENTO (Visível durante countdown) --- */}
          {showCancelCountdown && (
            <div className="text-center mb-3 p-3 bg-light border rounded">
              <p className="mb-2">O envio começará automaticamente em:</p>
              <h3 className="display-6 mb-3">{countdown}</h3>
              <Button variant="danger" onClick={handleCancelSending}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar Envio
              </Button>
            </div>
          )}

          {/* --- LISTA DE STATUS --- */}
          {emailStatusList.length === 0 && !showCancelCountdown ? ( // Adicionado !showCancelCountdown
            <div className="text-center"><Spinner animation="border" /> Preparando envio...</div>
          ) : (
            <ListGroup variant="flush">
              {emailStatusList.map((item) => (
                <ListGroup.Item key={item.frequencia_id} className="d-flex justify-content-between align-items-center flex-wrap">
                  {/* Informações do Aluno/Responsável */}
                  <div className="me-3 mb-2 mb-md-0" style={{ flexBasis: '60%'}}> 
                    <span className="fw-bold">{item.aluno_nome}</span>
                    <br />
                    <small className="text-muted">
                      Resp.: {item.responsavel_nome || 'N/I'} | Email: {item.responsavel_email || 'Não Cadastrado'}
                    </small>
                  </div>
                  {/* Status do Envio */}
                  <div style={{ flexBasis: '30%', textAlign: 'right' }}>
                    {item.status === 'pending' && !showCancelCountdown && ( // Mostra 'Pendente' se o countdown acabou e ainda não enviou
                       <Badge bg="secondary" pill>Pendente</Badge>
                    )}
                     {item.status === 'sending' && ( // Status visual enquanto chama API
                      <>
                        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                        <small>Enviando...</small>
                      </>
                    )}
                    {item.status === 'success' && (
                      <Badge bg="success" pill>Enviado</Badge>
                    )}
                    {item.status === 'failure' && (
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip id={`tooltip-error-${item.frequencia_id}`}>
                            <strong>Motivo:</strong> {item.erro}
                          </Tooltip>
                        }
                      >
                        <Badge bg="danger" pill style={{ cursor: 'help' }}>
                          Falha <i className="bi bi-exclamation-circle ms-1"></i>
                        </Badge>
                      </OverlayTrigger>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* Mostra botão Fechar apenas quando tudo termina */}
          {!isSendingEmail && !showCancelCountdown && (
             <Button variant="secondary" onClick={() => setShowEmailStatusModal(false)}>
              Fechar
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    </Container>
  );
}