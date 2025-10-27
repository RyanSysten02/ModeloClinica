import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Container, Row, Col, Card, Button, Table, Form, Spinner, Collapse, Dropdown, Badge,
  Modal,
  Alert,
  OverlayTrigger,
  Tooltip,
  ListGroup,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import TurmaService from "../../services/Turma";
import DisciplinaService from "../../services/Disciplina";

// --- Função auxiliar: salvarStatusNotificacao (MODIFICADA) ---
// Agora espera um array de frequencia_ids diretamente
const salvarStatusNotificacao = async (frequencia_ids, novoStatus) => {
  if (!Array.isArray(frequencia_ids) || frequencia_ids.length === 0) {
    console.warn("salvarStatusNotificacao chamado sem IDs válidos.");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:5001/api/frequencia/notificacao', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ frequencia_ids, status: novoStatus }) // Envia o array de IDs
    });
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({})); // Tenta pegar erro do corpo
      toast.error(`Erro ${response.status} ao salvar status: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    toast.error(`Falha de conexão ao salvar status: ${error.message}`);
  }
};

// --- Função auxiliar: getStatusVariant ---
const getStatusVariant = (status) => {
  if (!status) return 'warning'; // Default
  if (status.includes('whatsapp')) return 'success';
  if (status.includes('email')) return 'info';
  if (status === 'ignorado') return 'secondary';
  return 'warning'; // pendente ou misto
};

// --- Componente: CustomToggle (Ícone de Engrenagem) ---
const CustomToggle = React.forwardRef(({ children, onClick, disabled }, ref) => (
  <Button variant="outline-secondary" href="" ref={ref} disabled={disabled}
    onClick={(e) => { e.preventDefault(); onClick(e); }}
    title="Alterar status manualmente" className="d-flex align-items-center"
  > <i className="bi bi-gear-fill"></i> </Button>
));

// --- Componente Principal ---
export default function TelaNotificacaoFaltas() {
  // --- Estados de Dados e Filtros ---
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [alunosAusentes, setAlunosAusentes] = useState([]); // Dados brutos da API

  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  // Correção fuso horário na inicialização
  const getLocalDate = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
   };
  const [filtroDataInicio, setFiltroDataInicio] = useState(getLocalDate());
  const [filtroDataFim, setFiltroDataFim] = useState(getLocalDate());
  const [filtroNome, setFiltroNome] = useState("");

  // --- Estados de UI ---
  const [loading, setLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [selecionados, setSelecionados] = useState({}); // Chave: 'alunoId-data'
  const [selectAll, setSelectAll] = useState(false);

  // --- Estados da Fila Manual WhatsApp ---
  const [filaNotificacaoWhats, setFilaNotificacaoWhats] = useState([]); // Contém GRUPOS
  const [showFilaModalWhats, setShowFilaModalWhats] = useState(false);
  const [indiceFilaWhats, setIndiceFilaWhats] = useState(0);
  const [isSavingWhats, setIsSavingWhats] = useState(false);
  const [mensagemAtualWhats, setMensagemAtualWhats] = useState("");

  // --- Estados do Modal de Email ---
  const [showEmailStatusModal, setShowEmailStatusModal] = useState(false);
  const [emailStatusList, setEmailStatusList] = useState([]); // Contém GRUPOS com status
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showCancelCountdown, setShowCancelCountdown] = useState(false);
  const cancelTimerRef = useRef(null);
  const emailJobRef = useRef(null);

  // --- Estados Modal Detalhes ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null); // Guarda o GRUPO para detalhes


  // --- Configuração das Animações ---
  const animationVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }};
  const modalContentVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }};

  // --- Efeito: Carregar dados iniciais ---
  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        const turmasData = await TurmaService.findAll();
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
        const disciplinasData = await DisciplinaService.findAll();
        setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
      } catch (error) { toast.error(`Erro dados iniciais: ${error.message}`); }
    };
    fetchDadosIniciais();
  }, []);


  // --- Memo para Agrupar as Faltas ---
  const faltasAgrupadas = useMemo(() => {
    const grupos = {};
    alunosAusentes.forEach(falta => {
      const key = `${falta.aluno_id}-${falta.data_aula}`;
      if (!grupos[key]) {
        grupos[key] = {
          chaveUnica: key, aluno_id: falta.aluno_id, aluno_nome: falta.aluno_nome,
          data_aula: falta.data_aula, responsavel_nome: falta.responsavel_nome,
          responsavel_email: falta.responsavel_email, responsavel_celular: falta.responsavel_celular,
          faltas: [],
        };
      }
      grupos[key].faltas.push({
        frequencia_id: falta.frequencia_id, disciplina_nome: falta.disciplina_nome,
        notificacao_status: falta.notificacao_status,
      });
    });
    const arrayAgrupado = Object.values(grupos);
    arrayAgrupado.sort((a, b) => {
        const dateDiff = new Date(b.data_aula) - new Date(a.data_aula);
        if (dateDiff !== 0) return dateDiff;
        return a.aluno_nome.localeCompare(b.aluno_nome);
    });
    return arrayAgrupado;
  }, [alunosAusentes]);


  // --- Memo: Filtra os grupos pelo nome do aluno ---
  const faltasAgrupadasFiltradas = useMemo(() => {
    if (!filtroNome) return faltasAgrupadas;
    return faltasAgrupadas.filter(grupo =>
      grupo.aluno_nome.toLowerCase().includes(filtroNome.toLowerCase())
    );
  }, [faltasAgrupadas, filtroNome]);


  // --- Efeito: Lógica do "Selecionar Todos" ---
   useEffect(() => {
    if (faltasAgrupadasFiltradas.length > 0) {
      const allVisibleSelected = faltasAgrupadasFiltradas.every(
        grupo => selecionados[grupo.chaveUnica]
      );
      setSelectAll(allVisibleSelected);
    } else {
      setSelectAll(false);
    }
  }, [selecionados, faltasAgrupadasFiltradas]);


  // --- Helper: Copiar texto ---
  const copyToClipboard = async (text, successMessage) => {
    if (!text) { toast.warn("Nada para copiar."); return; }
    try { await navigator.clipboard.writeText(text); toast.success(successMessage || "Copiado!"); }
    catch (err) { toast.error("Falha ao copiar."); }
   };


  // --- Helper: Gerar a Mensagem WhatsApp (MODIFICADO - NOVO TEXTO) ---
  const gerarMensagemWhatsApp = (grupo) => {
    if (!grupo) return { url: null, text: "" };
    const telefone = grupo.responsavel_celular?.replace(/\D/g, '');
    const disciplinasFaltantes = [...new Set(grupo.faltas
        .map(f => f.disciplina_nome || 'N/A'))] // Pega nomes únicos
        .join(', '); // Junta com vírgula
    // Usa a data do grupo (YYYY-MM-DD) e formata com UTC
    const dataFormatada = new Date(grupo.data_aula + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    // --- NOVO FORMATO DA MENSAGEM ---
    const text = `Prezado(a) ${grupo.responsavel_nome || 'Responsável'}, informamos que o(a) aluno(a) ${grupo.aluno_nome} faltou à escola no dia ${dataFormatada} e ficou com falta nas disciplinas de ${disciplinasFaltantes}.\n\nCaso não esteja Ciente,\nPor favor, entre em contato com a escola.`;
    const url = telefone ? `https://wa.me/55${telefone}?text=${encodeURIComponent(text)}` : null;
    return { url, text };
  };


  // --- Ação: "Selecionar Todos" Checkbox ---
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelecionados(prev => {
      const newSelection = { ...prev };
      if (isChecked) { faltasAgrupadasFiltradas.forEach(grupo => newSelection[grupo.chaveUnica] = true); }
      else { faltasAgrupadasFiltradas.forEach(grupo => delete newSelection[grupo.chaveUnica]); }
      return newSelection;
    });
  };

  // --- Ação: Checkbox individual ---
  const toggleSelecionado = (chaveUnica) => {
    setSelecionados(prev => {
      const newSelection = { ...prev };
      if (newSelection[chaveUnica]) { delete newSelection[chaveUnica]; }
      else { newSelection[chaveUnica] = true; }
      if (!newSelection[chaveUnica]) setSelectAll(false); // Desmarca geral
      return newSelection;
    });
  };

  // --- Ação: Buscar Ausentes ---
   const handleBuscarAusentes = async () => {
    if (!filtroTurma || !filtroDataInicio || !filtroDataFim) { toast.warn("Selecione Turma e Período."); return; }
    setLoading(true); setBuscaRealizada(false); setAlunosAusentes([]); setFiltroNome("");
    try {
      const token = localStorage.getItem("token");
      // Força UTC para consistência no loop
      const startDate = new Date(filtroDataInicio + 'T00:00:00Z');
      const endDate = new Date(filtroDataFim + 'T00:00:00Z');
      const dias = [];
      for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        dias.push(d.toISOString().split('T')[0]); // Formato YYYY-MM-DD
      }

      const responses = await Promise.all(
        dias.map(async (data) => { // 'data' aqui é YYYY-MM-DD
          const url = new URL(`http://localhost:5001/api/frequencia/ausentes`);
          url.searchParams.append("data_aula", data); // Envia YYYY-MM-DD
          url.searchParams.append("turma_id", filtroTurma);
          if (filtroDisciplina) { url.searchParams.append("disciplina_id", filtroDisciplina); }
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const json = await res.json();
            // Garante que a data_aula no objeto é YYYY-MM-DD
            return json.map((a) => ({ ...a, data_aula: data }));
          } else { console.error(`Erro ${res.status} para ${data}`); return []; }
        })
      );
      const todos = responses.flat();
      const unicos = []; const vistos = new Set(); // Remove duplicatas de frequencia_id
      for (const aluno of todos) { if (!vistos.has(aluno.frequencia_id)) { vistos.add(aluno.frequencia_id); unicos.push(aluno); }}
      setAlunosAusentes(unicos); // Define dados brutos, useMemo agrupa/ordena
    } catch (error) { toast.error(`Erro busca: ${error.message}`); }
    finally { setLoading(false); setBuscaRealizada(true); setSelecionados({}); setSelectAll(false); }
  };


  // --- Ação: Get Selecionados ---
  const getGruposSelecionados = () => faltasAgrupadas.filter(grupo => selecionados[grupo.chaveUnica]);

  // --- Helper: Extrai frequencia_ids dos grupos ---
  const getFrequenciaIdsSelecionados = (grupos) => {
      return grupos.reduce((acc, grupo) => { grupo.faltas.forEach(falta => acc.push(falta.frequencia_id)); return acc; }, []);
  };

  // --- Ação: Alterar Status Manualmente ---
  const alterarStatusEmMassa = async (novoStatus) => {
    const gruposSelecionados = getGruposSelecionados();
    if (gruposSelecionados.length === 0) { toast.info("Selecione aluno/dia."); return; }
    const idsParaAtualizar = getFrequenciaIdsSelecionados(gruposSelecionados);
    if (idsParaAtualizar.length > 0) {
        await salvarStatusNotificacao(idsParaAtualizar, novoStatus);
        setAlunosAusentes(prevAusentes =>
          prevAusentes.map(falta => idsParaAtualizar.includes(falta.frequencia_id) ? { ...falta, notificacao_status: novoStatus } : falta )
        );
        toast.success(`Status alterado.`);
    }
  };


  // --- Ação: Iniciar Fila WhatsApp ---
  const handleNotificarWhatsApp = () => {
    const gruposParaNotificar = getGruposSelecionados();
    if (gruposParaNotificar.length === 0) { toast.info("Selecione aluno/dia."); return; }
    setFilaNotificacaoWhats(gruposParaNotificar); // Usa fila específica
    setIndiceFilaWhats(0);
    setShowFilaModalWhats(true); // Abre modal específico
    const { text } = gerarMensagemWhatsApp(gruposParaNotificar[0]);
    setMensagemAtualWhats(text); // Usa estado específico
  };

  // --- Ação: Enviar Notificação Atual (Modal WhatsApp) ---
  const handleEnviarNotificacaoAtualWhats = () => {
    const grupoAtual = filaNotificacaoWhats[indiceFilaWhats];
    if (grupoAtual) {
      const { url } = gerarMensagemWhatsApp(grupoAtual);
      if (url) { window.open(url, '_blank'); }
      else { toast.error(`Aluno ${grupoAtual.aluno_nome} sem celular.`); }
    }
  };

  // --- Ação: Próximo da Fila (Modal WhatsApp) ---
  const handleProximoDaFilaWhats = async () => {
    if (isSavingWhats) return;
    setIsSavingWhats(true);
    const grupoProcessado = filaNotificacaoWhats[indiceFilaWhats];
    if (!grupoProcessado) { setIsSavingWhats(false); return; }

    const idsParaAtualizar = grupoProcessado.faltas.map(f => f.frequencia_id);
    if(idsParaAtualizar.length > 0) {
      await salvarStatusNotificacao(idsParaAtualizar, 'notificado_whatsapp');
      setAlunosAusentes(prevAusentes =>
        prevAusentes.map(falta => idsParaAtualizar.includes(falta.frequencia_id) ? { ...falta, notificacao_status: 'notificado_whatsapp' } : falta )
      );
    }
    toggleSelecionado(grupoProcessado.chaveUnica); // Desmarca na tabela principal

    const novoIndice = indiceFilaWhats + 1;
    if (novoIndice < filaNotificacaoWhats.length) {
      const proximoGrupo = filaNotificacaoWhats[novoIndice];
      const { text } = gerarMensagemWhatsApp(proximoGrupo);
      setMensagemAtualWhats(text);
      setIndiceFilaWhats(novoIndice);
      setIsSavingWhats(false);
    } else {
      setShowFilaModalWhats(false);
      toast.success("Fila WhatsApp concluída!");
      setIsSavingWhats(false);
    }
  };

  // --- Ação: Voltar ao Anterior (Modal WhatsApp) ---
  const handleVoltarAoAnteriorWhats = () => {
    if (isSavingWhats) return;
    const novoIndice = indiceFilaWhats - 1;
    if (novoIndice >= 0) {
      const grupoAnterior = filaNotificacaoWhats[novoIndice];
      const { text } = gerarMensagemWhatsApp(grupoAnterior);
      setMensagemAtualWhats(text);
      setIndiceFilaWhats(novoIndice);
    } else { toast.info("Já está no primeiro."); }
  };

  // --- NOVA AÇÃO: Ignorar o Aluno/Dia Atual (Modal WhatsApp) ---
  const handleIgnorarAtualWhats = () => {
    // Não faz nada se já estiver salvando o próximo
    if (isSavingWhats) return;

    // Apenas avança o índice
    const novoIndice = indiceFilaWhats + 1;

    // Verifica se ainda há alunos na fila
    if (novoIndice < filaNotificacaoWhats.length) {
      // Prepara o próximo grupo
      const proximoGrupo = filaNotificacaoWhats[novoIndice];
      const { text } = gerarMensagemWhatsApp(proximoGrupo);
      setMensagemAtualWhats(text); // Atualiza a mensagem a ser exibida
      setIndiceFilaWhats(novoIndice); // Avança o índice
    } else {
      // A fila acabou após ignorar o último
      setShowFilaModalWhats(false); // Fecha o modal
      toast.info("Fila WhatsApp concluída (último item ignorado).");
      // Reseta estados da fila se necessário (já feito no handleCancelarFilaWhats que pode ser chamado implicitamente pelo onHide)
      // Se onHide não for chamado automaticamente, adicione os resets aqui:
      // setFilaNotificacaoWhats([]);
      // setIndiceFilaWhats(0);
      // setMensagemAtualWhats("");
      // setIsSavingWhats(false);
    }
     // NÃO chama salvarStatusNotificacao
     // NÃO chama toggleSelecionado
  };

  // --- Ação: Cancelar Fila (Modal WhatsApp) ---
   const handleCancelarFilaWhats = () => {
    setShowFilaModalWhats(false); setFilaNotificacaoWhats([]); setIndiceFilaWhats(0);
    setMensagemAtualWhats(""); setIsSavingWhats(false);
    toast.info("Fila WhatsApp cancelada.");
  };

// --- Ação: Notificar por E-mail ---
  const handleNotificarEmail = async () => {
    const gruposParaNotificar = getGruposSelecionados();
    if (gruposParaNotificar.length === 0) { toast.info("Selecione aluno/dia."); return; }
    const idsParaEnviar = getFrequenciaIdsSelecionados(gruposParaNotificar);

    // Guarda os dados para o useEffect usar
    emailJobRef.current = { ids: idsParaEnviar, grupos: gruposParaNotificar };

    const initialStatusList = gruposParaNotificar.map(grupo => ({
        chaveUnica: grupo.chaveUnica, frequencia_ids: grupo.faltas.map(f => f.frequencia_id),
        aluno_nome: grupo.aluno_nome, responsavel_nome: grupo.responsavel_nome,
        responsavel_email: grupo.responsavel_email, status: 'pending', erro: null
    }));
    setEmailStatusList(initialStatusList);
    setShowEmailStatusModal(true); setIsSendingEmail(false);
    setShowCancelCountdown(true);
    setCountdown(5); // Inicia a contagem

    // Limpa timer antigo e inicia um novo
    if (cancelTimerRef.current) { clearInterval(cancelTimerRef.current); }
    cancelTimerRef.current = setInterval(() => {
        // O timer AGORA SÓ FAZ ISSO:
        setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);
  };

// --- Função: Inicia envio de Email (CORRIGIDA - Toast Único) ---
 // --- Função: Inicia envio de Email (CORRIGIDA - Lógica de Contagem) ---
  const startEmailSendingProcess = async (frequencia_ids, gruposOriginais) => {
    setIsSendingEmail(true);
    toast.info(`Processando envio para ${gruposOriginais.length} responsável(eis)...`);
    setEmailStatusList(prevList => prevList.map(item => ({ ...item, status: 'sending' })));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5001/api/notificacao/email-em-massa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ frequencia_ids })
      });
      const data = await res.json();

      if (res.ok) {
        const idsSucesso = data.sucesso?.map(item => item.id) || [];
        const falhasMap = new Map(data.falha?.map(item => [item.id, item.erro]));

        // --- INÍCIO DA LÓGICA DE CONTAGEM CORRIGIDA ---
        let numEmailsSucesso = 0;
        let numEmailsFalha = 0;

        // Itera sobre os grupos que TENTAMOS enviar
        gruposOriginais.forEach(grupo => {
            // Verifica se TODOS os IDs deste grupo estão na lista de sucesso
            const todosSucesso = grupo.faltas.every(f => idsSucesso.includes(f.frequencia_id));
            if (todosSucesso) {
                numEmailsSucesso++;
            } else {
                numEmailsFalha++;
            }
        });

        // Monta a mensagem do toast baseada na contagem CORRETA de GRUPOS
        let toastMessage = `${numEmailsSucesso} e-mail(s) enviado(s) com sucesso.`;
        if (numEmailsFalha > 0) {
            toastMessage += ` ${numEmailsFalha} falha(s).`;
            toast.warn(toastMessage); // Usa warn se houve falhas
        } else if (numEmailsSucesso > 0) { // Mostra sucesso apenas se houve algum
             toast.success(toastMessage); // Usa success se tudo OK
        } else {
             // Caso nenhum email tenha sido enviado com sucesso e nenhuma falha reportada explicitamente
             // Isso pode acontecer se, por exemplo, todos os responsáveis não tinham email
             toast.info("Nenhum e-mail enviado (verifique cadastros).");
        }
        // --- FIM DA LÓGICA DE CONTAGEM CORRIGIDA ---


        // Atualiza a lista de status no modal (lógica visual)
        setEmailStatusList(prevList => prevList.map(itemGrupo => {
            const todosSucesso = itemGrupo.frequencia_ids.every(id => idsSucesso.includes(id));
            if (todosSucesso) {
                return { ...itemGrupo, status: 'success' };
            } else {
                let erroGrupo = 'Falha no envio.';
                for(const id of itemGrupo.frequencia_ids) { if(falhasMap.has(id)) { erroGrupo = falhasMap.get(id); break; } }
                 const algumStatusRetornado = itemGrupo.frequencia_ids.some(id => idsSucesso.includes(id) || falhasMap.has(id));
                 if (!algumStatusRetornado && !todosSucesso) { erroGrupo = 'Status não retornado.'; }
                return { ...itemGrupo, status: 'failure', erro: erroGrupo };
            }
        }));

        // Atualiza a tabela principal (lógica inalterada, usa idsSucesso individuais)
        if (idsSucesso.length > 0) {
            setAlunosAusentes(prev => prev.map(a => idsSucesso.includes(a.frequencia_id) ? { ...a, notificacao_status: 'notificado_email' } : a ));
            setSelecionados(prev => {
                const newSelection = {...prev};
                gruposOriginais.forEach(grupo => {
                    if (grupo.faltas.every(f => idsSucesso.includes(f.frequencia_id))) { delete newSelection[grupo.chaveUnica]; }
                });
                return newSelection;
            });
        }
      } else { // Falha na requisição
        toast.error(data.message || "Falha grave no envio.");
        setEmailStatusList(prevList => prevList.map(item => ({ ...item, status: 'failure', erro: data.message || "Erro API" })));
      }
    } catch (error) { // Erro de conexão
      toast.error("Erro de conexão.");
       setEmailStatusList(prevList => prevList.map(item => ({ ...item, status: 'failure', erro: "Erro conexão" })));
    } finally {
      setIsSendingEmail(false);
    }
  };


// --- Função: Cancelar Envio de Email ---
   const handleCancelSending = () => {
    if (cancelTimerRef.current) { clearInterval(cancelTimerRef.current); cancelTimerRef.current = null; }
    
    emailJobRef.current = null; // <--- ADICIONE ISSO (Limpa o job pendente)

    setShowEmailStatusModal(false); setEmailStatusList([]); setCountdown(5);
    setShowCancelCountdown(false); setIsSendingEmail(false);
    toast.warn("Envio cancelado.");
  };

  // --- Ação: Abrir Modal de Detalhes ---
  const handleShowDetails = (grupo) => {
    setDetailsData(grupo); // Guarda o grupo clicado
    setShowDetailsModal(true); // Abre o modal
  };

  // Efeito para limpar o timer
  useEffect(() => { return () => { if (cancelTimerRef.current) { clearInterval(cancelTimerRef.current); cancelTimerRef.current = null; } }; }, []);

  // ... adicione junto com seus outros useEffects

  // --- Efeito: Observa o countdown para disparar o envio de email ---
  useEffect(() => {
    // Se o countdown não chegou a 0, ou se o modal não está visível, não faz nada
    if (countdown > 0 || !showCancelCountdown) {
      return;
    }

    // --- CHEGOU A 0 ---
    
    // 1. Para o timer
    if (cancelTimerRef.current) {
      clearInterval(cancelTimerRef.current);
      cancelTimerRef.current = null;
    }

    // 2. Esconde a UI de countdown
    setShowCancelCountdown(false);

    // 3. Verifica se há um "trabalho" (job) esperando no Ref
    if (emailJobRef.current) {
      const { ids, grupos } = emailJobRef.current;
      
      // 4. Inicia o envio (UMA ÚNICA VEZ)
      startEmailSendingProcess(ids, grupos);
      
      // 5. Limpa o ref para não reenviar
      emailJobRef.current = null; 
    }

  }, [countdown, showCancelCountdown]); // Dependências do Effect
  // Contagem de grupos selecionados
  const numSelecionados = Object.values(selecionados).filter(Boolean).length;

  // --- Renderização ---
  return (
    <Container className="py-5">
      <motion.div initial="hidden" animate="visible" variants={animationVariants}>
        <h2 className="text-center mb-4">Notificar Ausências de Alunos</h2>

        {/* --- Card de Filtros --- */}
        <Card className="shadow-sm p-4 mb-4">
            <Row className="g-3 align-items-end">
                <Col md={3}><Form.Label>Turma (*)</Form.Label><Form.Select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}><option value="">Selecione...</option>{turmas.map(t => (<option key={t.id} value={t.id}>{t.nome}</option>))}</Form.Select></Col>
                <Col md={3}><Form.Label>Disciplina</Form.Label><Form.Select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)}><option value="">Todas</option>{disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nome}</option>))}</Form.Select></Col>
                <Col md={3}><Form.Label>Data Inicial (*)</Form.Label><Form.Control type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} /></Col>
                <Col md={2}><Form.Label>Data Final (*)</Form.Label><Form.Control type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} /></Col>
                <Col md={1}><Button variant="primary" onClick={handleBuscarAusentes} className="w-100" disabled={loading} title="Buscar"><i className="bi bi-search"></i></Button></Col>
            </Row>
             <Collapse in={buscaRealizada && faltasAgrupadas.length > 0}>
                 <div className="mt-4 pt-3 border-top">
                     <Row className="align-items-center">
                        <Col md={5} lg={6}>
                          <strong>{numSelecionados} dia(s) de falta selecionado(s)</strong>
                        </Col>
                        <Col md={7} lg={6} className="d-flex gap-2 justify-content-md-end">
                             <Button variant="success" onClick={handleNotificarWhatsApp} disabled={numSelecionados === 0}> <i className="bi bi-whatsapp me-2"></i>WhatsApp </Button>
                             <Button variant="info" onClick={handleNotificarEmail} disabled={numSelecionados === 0 || isSendingEmail || showCancelCountdown}>
                                {(isSendingEmail || showCancelCountdown) ? <Spinner as="span" animation="border" size="sm" /> : <i className="bi bi-envelope me-2"></i>} E-mail
                            </Button>
                            <Dropdown onSelect={(status) => alterarStatusEmMassa(status)}>
                                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-options" disabled={numSelecionados === 0}/>
                                 <Dropdown.Menu>
                                    <Dropdown.Header>Alterar status</Dropdown.Header>
                                    <Dropdown.Item eventKey="pendente">Pendente</Dropdown.Item>
                                    <Dropdown.Item eventKey="notificado_whatsapp">Notif. WhatsApp</Dropdown.Item>
                                    <Dropdown.Item eventKey="notificado_email">Notif. E-mail</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                     </Row>
                 </div>
             </Collapse>
        </Card>

        {/* --- Card de Resultados e Tabela (MODIFICADO) --- */}
        <AnimatePresence>
          {buscaRealizada && (
            <motion.div key="resultados" variants={animationVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
                  <span className="fw-bold">Resultados da Busca</span>
                  {faltasAgrupadas.length > 0 && (
                    <Form.Control type="text" placeholder="Filtrar por nome..." value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} style={{ width: '300px' }} className="mt-2 mt-md-0" />
                  )}
                </Card.Header>
                <Card.Body>
                  {loading ? ( <div className="text-center"><Spinner /></div>
                  ) : faltasAgrupadas.length === 0 ? (
                    <div className="text-center text-muted p-4">Nenhuma falta encontrada.</div>
                  ) : faltasAgrupadasFiltradas.length === 0 ? (
                    <div className="text-center text-muted p-4">Nenhum aluno com o nome "{filtroNome}".</div>
                  ) : (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}><Form.Check type="checkbox" title="Selecionar Todos Visíveis" checked={selectAll} onChange={handleSelectAll}/></th>
                          <th>Aluno</th>
                          <th>Responsável</th>
                          <th>Data da Falta</th>
                          <th>Contato</th>
                          <th className="text-center">Status</th>
                          <th className="text-center" style={{width: '90px'}}>Detalhes</th> {/* Ajuste largura */}
                        </tr>
                      </thead>
                      <tbody>
                        {faltasAgrupadasFiltradas.map(grupo => {
                          // Determina o status consolidado
                          const statusUnicos = new Set(grupo.faltas.map(f => f.notificacao_status));
                          let statusConsolidado = 'Pendente'; let statusVariant = 'warning';
                           if (statusUnicos.size === 1 && !statusUnicos.has('pendente')) {
                               const unicoStatus = statusUnicos.values().next().value;
                               // Simplifica texto do status
                               statusConsolidado = unicoStatus.includes('whatsapp') ? 'WhatsApp' : (unicoStatus.includes('email') ? 'Email' : 'Outro');
                               statusVariant = getStatusVariant(unicoStatus);
                           } else if (statusUnicos.size > 1 && !statusUnicos.has('pendente')) {
                               statusConsolidado = 'Misto'; statusVariant = 'secondary';
                           } // Se tiver 'pendente', mantém 'Pendente' / 'warning'

                          return (
                            <tr key={grupo.chaveUnica}>
                              <td><Form.Check type="checkbox" checked={!!selecionados[grupo.chaveUnica]} onChange={() => toggleSelecionado(grupo.chaveUnica)}/></td>
                              <td>{grupo.aluno_nome}</td>
                              <td>{grupo.responsavel_nome || <span className="text-muted">N/I</span>}</td>
                              {/* Usa data_aula do grupo com UTC */}
                              <td>{new Date(grupo.data_aula + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                              <td>{grupo.responsavel_celular || grupo.responsavel_email || <span className="text-muted">N/I</span>}</td>
                              <td className="text-center"> <Badge bg={statusVariant}>{statusConsolidado}</Badge> </td>
                              {/* --- Botão Detalhes --- */}
                              <td className="text-center">
                                <Button variant="outline-secondary" size="sm" onClick={() => handleShowDetails(grupo)} title="Ver detalhes">
                                  <i className="bi bi-list-ul"></i>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- MODAL DA FILA WHATSAPP (Estrutura Mantida) --- */}
      <Modal show={showFilaModalWhats} onHide={handleCancelarFilaWhats} backdrop="static" keyboard={false} centered size="lg" >
        <Modal.Header closeButton><Modal.Title>Fila de Notificação - WhatsApp</Modal.Title></Modal.Header>
        {filaNotificacaoWhats.length > 0 && filaNotificacaoWhats[indiceFilaWhats] ? (
          <>
            <Modal.Body>
              {/* --- Aviso Mantido --- */}
              <Alert variant="danger">
                  <Alert.Heading as="h6">Atenção!</Alert.Heading>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                    Realizar o envio de diversas notificações de whatsapp em um curto espaço de tempo, podem acarretar no bloqueio ou perca do numero de whatsapp.
                    <strong> Utilize a funcionalidade com moderação.</strong>
                  </p>
              </Alert>
              <p className="text-muted"> Clique em "Enviar Notificação" para abrir o WhatsApp ou copie os dados. </p>
              <AnimatePresence mode="wait">
                <motion.div key={indiceFilaWhats} variants={modalContentVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} >
                  <Card bg="light" className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <Card.Title className="mb-1">{filaNotificacaoWhats[indiceFilaWhats].aluno_nome}</Card.Title>
                        {/* --- Status Mantido --- */}
                        <Badge bg="primary" pill>{indiceFilaWhats + 1} de {filaNotificacaoWhats.length}</Badge>
                      </div>
                      <Card.Text>
                        <strong>Responsável:</strong> {filaNotificacaoWhats[indiceFilaWhats].responsavel_nome || <span className="text-danger">N/I</span>}<br/>
                        <strong>Contato:</strong>
                        {filaNotificacaoWhats[indiceFilaWhats].responsavel_celular ? ( <> {filaNotificacaoWhats[indiceFilaWhats].responsavel_celular} <Button variant="link" size="sm" className="p-0 ms-2" title="Copiar" onClick={() => copyToClipboard(filaNotificacaoWhats[indiceFilaWhats].responsavel_celular.replace(/\D/g, ''), "Número copiado!")} > <i className="bi bi-clipboard-check"></i> </Button> </> ) : ( <span className="text-danger">Sem celular</span> )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                  <Form.Group>
                    <Form.Label className="fw-bold">Mensagem:</Form.Label>
                    <Form.Control as="textarea" rows={5} value={mensagemAtualWhats} readOnly style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }} />
                    <Button variant="outline-secondary" size="sm" className="mt-2" onClick={() => copyToClipboard(mensagemAtualWhats, "Mensagem copiada!")} > <i className="bi bi-clipboard me-2"></i> Copiar </Button>
                   </Form.Group>
                </motion.div>
              </AnimatePresence>
            </Modal.Body>
            <Modal.Footer>
               <Button variant="secondary" onClick={handleCancelarFilaWhats} className="me-auto" disabled={isSavingWhats}>Cancelar Fila</Button>
               <Button variant="outline-secondary" onClick={handleVoltarAoAnteriorWhats} disabled={indiceFilaWhats === 0 || isSavingWhats} > Voltar </Button>
               <Button
                 variant="outline-warning" // Ou outra cor que preferir
                 onClick={handleIgnorarAtualWhats}
                 disabled={isSavingWhats}
               >
                 Ignorar
               </Button>
               <Button variant="success" onClick={handleEnviarNotificacaoAtualWhats} disabled={isSavingWhats}> <i className="bi bi-whatsapp me-2"></i> Enviar Notificação </Button>
               <Button variant="primary" onClick={handleProximoDaFilaWhats} disabled={isSavingWhats}>
                 {isSavingWhats ? ( <><Spinner as="span" size="sm" /> Salvando...</> ) : ( (indiceFilaWhats === filaNotificacaoWhats.length - 1) ? "Salvar e Concluir" : "Salvar e Próximo" )}
               </Button>
             </Modal.Footer>
          </>
        ) : ( <Modal.Body> <Spinner size="sm" /> Carregando... </Modal.Body> )}
      </Modal>

      {/* --- MODAL DE STATUS DE EMAIL --- */}
       <Modal
        show={showEmailStatusModal}
        onHide={() => !isSendingEmail && !showCancelCountdown && setShowEmailStatusModal(false)}
        backdrop={(isSendingEmail || showCancelCountdown) ? 'static' : true}
        keyboard={!(isSendingEmail || showCancelCountdown)}
        centered size="lg" >
         <Modal.Header closeButton={!(isSendingEmail || showCancelCountdown)}>
        <Modal.Title>
          {showCancelCountdown
            ? "Confirmar Envio de E-mail" // <--- Texto Fixo durante countdown
            : isSendingEmail
            ? "Enviando E-mails..."
            : "Resultado do Envio de E-mails"}
        </Modal.Title>
      </Modal.Header>
         <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {showCancelCountdown && ( <div className="text-center mb-3 p-3 bg-light border rounded"> <p className="mb-2">Envio automático em:</p> <h3 className="display-6 mb-3">{countdown}</h3> <Button variant="danger" onClick={handleCancelSending}> <i className="bi bi-x-circle me-2"></i> Cancelar </Button> </div> )}
            {emailStatusList.length === 0 && !showCancelCountdown ? ( <div className="text-center"><Spinner /> Preparando...</div> ) : (
            <ListGroup variant="flush">
              {emailStatusList.map((itemGrupo) => (
                <ListGroup.Item key={itemGrupo.chaveUnica} className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="me-3 mb-2 mb-md-0" style={{ flexBasis: '60%'}}>
                    <span className="fw-bold">{itemGrupo.aluno_nome}</span> <br />
                    <small className="text-muted"> Resp.: {itemGrupo.responsavel_nome || 'N/I'} | Email: {itemGrupo.responsavel_email || 'Não Cad.'} </small>
                  </div>
                  <div style={{ flexBasis: '30%', textAlign: 'right' }}>
                    {itemGrupo.status === 'pending' && !showCancelCountdown && ( <Badge bg="secondary" pill>Pendente</Badge> )}
                    {itemGrupo.status === 'sending' && ( <> <Spinner size="sm" className="me-2" /> <small>Enviando...</small> </> )}
                    {itemGrupo.status === 'success' && ( <Badge bg="success" pill>Enviado</Badge> )}
                    {itemGrupo.status === 'failure' && (
                       <OverlayTrigger overlay={<Tooltip><strong>Motivo:</strong> {itemGrupo.erro}</Tooltip>} >
                           <Badge bg="danger" pill style={{ cursor: 'help' }}> Falha <i className="bi bi-info-circle ms-1"></i> </Badge>
                       </OverlayTrigger>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
         </Modal.Body>
         <Modal.Footer> {!isSendingEmail && !showCancelCountdown && ( <Button variant="secondary" onClick={() => setShowEmailStatusModal(false)}> Fechar </Button> )} </Modal.Footer>
      </Modal>

       {/* --- NOVO: MODAL DE DETALHES DAS DISCIPLINAS --- */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes das Ausências</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsData ? (
            <>
              <h5>{detailsData.aluno_nome}</h5>
              <p className="text-muted mb-2">
                Data: {new Date(detailsData.data_aula + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
              <h6>Disciplinas Ausentes:</h6>
              {detailsData.faltas && detailsData.faltas.length > 0 ? (
                <ListGroup variant="flush">
                  {detailsData.faltas.map(falta => (
                    <ListGroup.Item key={falta.frequencia_id} className="d-flex justify-content-between align-items-center ps-0">
                      <span> <i className="bi bi-dot"></i> {falta.disciplina_nome || 'N/A'}</span>
                      <Badge bg={getStatusVariant(falta.notificacao_status)} pill>
                        {falta.notificacao_status === 'pendente' ? 'Pendente' :
                         falta.notificacao_status === 'notificado_whatsapp' ? 'WhatsApp' :
                         falta.notificacao_status === 'notificado_email' ? 'Email' :
                         falta.notificacao_status}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                 <p className="text-muted">Nenhuma disciplina registrada.</p>
              )}
            </>
          ) : (
            <div className="text-center"><Spinner size="sm" /> Carregando...</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}