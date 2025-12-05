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

// --- NOVO --- Importe o seu Modal de Confirmação
// (Ajuste o caminho se necessário)
import ModalConfirmacao from "../ModaisUteis/ModalConfirmação"; // Assumindo que está em components

// --- Função auxiliar: salvarStatusNotificacao (MODIFICADA) ---
// (Sem alterações nesta função)
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

// --- MODIFICADO --- Função auxiliar: getStatusVariant (mais inteligente)
const getStatusVariant = (status) => {
  if (!status || status === 'pendente') return 'warning'; // Pendente
  
  const hasWhats = status.includes('whatsapp');
  const hasEmail = status.includes('email');
  
  if (hasWhats && hasEmail) return 'primary'; // Misto (Wpp/Email)
  if (hasWhats) return 'success'; // Só WhatsApp
  if (hasEmail) return 'info'; // Só Email
  if (status === 'ignorado') return 'secondary';
  
  return 'secondary'; // Outro
};

// --- Componente: CustomToggle (Ícone de Engrenagem) ---
// (Sem alterações)
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

  // --- NOVO: Estados para o Modal de Confirmação ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // Armazena a função a ser executada
  const [confirmMessage, setConfirmMessage] = useState("");


  // --- Configuração das Animações ---
  const animationVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }};
  const modalContentVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }};

  // --- Efeito: Carregar dados iniciais ---
  useEffect(() => {
    // (Sem alterações)
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
    // (Sem alterações)
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
    // (Sem alterações)
    if (!filtroNome) return faltasAgrupadas;
    return faltasAgrupadas.filter(grupo =>
      grupo.aluno_nome.toLowerCase().includes(filtroNome.toLowerCase())
    );
  }, [faltasAgrupadas, filtroNome]);


  // --- Efeito: Lógica do "Selecionar Todos" ---
    useEffect(() => {
    // (Sem alterações)
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
    // (Sem alterações)
    if (!text) { toast.warn("Nada para copiar."); return; }
    try { await navigator.clipboard.writeText(text); toast.success(successMessage || "Copiado!"); }
    catch (err) { toast.error("Falha ao copiar."); }
   };


  // --- Helper: Gerar a Mensagem WhatsApp (MODIFICADO - NOVO TEXTO) ---
  const gerarMensagemWhatsApp = (grupo) => {
    // (Sem alterações)
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
    // (Sem alterações)
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
    // (Sem alterações)
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
    // (Sem alterações)
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

  // --- NOVO: Helper para checar notificações existentes ---
  const checkForExistingNotifications = (grupos) => {
    for (const grupo of grupos) {
      for (const falta of grupo.faltas) {
        // Se o status existir E não for 'pendente', consideramos como já notificado
        if (falta.notificacao_status && falta.notificacao_status !== 'pendente') {
          return true; // Encontrou um
        }
      }
    }
    return false; // Nenhum encontrado
  };

  // --- Ação: Alterar Status Manualmente ---
  const alterarStatusEmMassa = async (novoStatus) => {
    // (Sem alterações)
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

  // --- MODIFICADO: Lógica do WhatsApp dividida ---

  // --- Etapa 2: Ação real de iniciar a fila do WhatsApp ---
  const proceedWithWhatsApp = (gruposParaNotificar) => {
    setFilaNotificacaoWhats(gruposParaNotificar);
    setIndiceFilaWhats(0);
    setShowFilaModalWhats(true); // Abre modal específico
    const { text } = gerarMensagemWhatsApp(gruposParaNotificar[0]);
    setMensagemAtualWhats(text); // Usa estado específico
  };

  // --- Etapa 1: Interceptador do clique no botão WhatsApp ---
  const handleNotificarWhatsApp = () => {
    const gruposParaNotificar = getGruposSelecionados();
    if (gruposParaNotificar.length === 0) { toast.info("Selecione aluno/dia."); return; }

    // --- NOVO: Verificação ---
    const hasNotified = checkForExistingNotifications(gruposParaNotificar);

    if (hasNotified) {
      setConfirmMessage("Alguns dos alunos/dias selecionados já foram notificados. Deseja reenviar a notificação via WhatsApp?");
      // Armazena a ação que deve ser executada se o usuário confirmar
      setConfirmAction(() => () => proceedWithWhatsApp(gruposParaNotificar)); 
      setShowConfirmModal(true);
    } else {
      // Se ninguém foi notificado, prossegue direto
      proceedWithWhatsApp(gruposParaNotificar);
    }
  };

  // --- Ação: Enviar Notificação Atual (Modal WhatsApp) ---
  const handleEnviarNotificacaoAtualWhats = () => {
    // (Sem alterações)
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
      
      // --- MODIFICADO: Chama ANEXAR em vez de salvar/sobrescrever ---
      await appendarStatusNotificacao(idsParaAtualizar, 'notificado_whatsapp');

      // --- MODIFICADO: Lógica de atualização do estado local ---
      setAlunosAusentes(prevAusentes =>
        prevAusentes.map(falta => {
          if (!idsParaAtualizar.includes(falta.frequencia_id)) return falta;

          // Replica a lógica do backend no estado local
          const statusAntigo = falta.notificacao_status;
          let statusNovo;
          if (statusAntigo === 'pendente') {
            statusNovo = 'notificado_whatsapp';
          } else if (!statusAntigo.includes('notificado_whatsapp')) {
            statusNovo = `${statusAntigo},notificado_whatsapp`;
          } else {
            statusNovo = statusAntigo; // Já estava lá
          }
          return { ...falta, notificacao_status: statusNovo };
        })
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
    // (Sem alterações)
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
    // (Sem alterações)
    if (isSavingWhats) return;
    const novoIndice = indiceFilaWhats + 1;
    if (novoIndice < filaNotificacaoWhats.length) {
      const proximoGrupo = filaNotificacaoWhats[novoIndice];
      const { text } = gerarMensagemWhatsApp(proximoGrupo);
      setMensagemAtualWhats(text); 
      setIndiceFilaWhats(novoIndice); 
    } else {
      setShowFilaModalWhats(false); 
      toast.info("Fila WhatsApp concluída (último item ignorado).");
    }
  };

  // --- Ação: Cancelar Fila (Modal WhatsApp) ---
    const handleCancelarFilaWhats = () => {
    // (Sem alterações)
    setShowFilaModalWhats(false); setFilaNotificacaoWhats([]); setIndiceFilaWhats(0);
    setMensagemAtualWhats(""); setIsSavingWhats(false);
    toast.info("Fila WhatsApp cancelada.");
  };

// --- MODIFICADO: Lógica do E-mail dividida ---

// --- Etapa 2: Ação real de iniciar o envio de E-mail ---
const proceedWithEmail = (gruposParaNotificar) => {
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
    setCountdown(prevCountdown => prevCountdown - 1);
  }, 1000);
};

// --- Etapa 1: Interceptador do clique no botão E-mail ---
  const handleNotificarEmail = async () => {
    const gruposParaNotificar = getGruposSelecionados();
    if (gruposParaNotificar.length === 0) { toast.info("Selecione aluno/dia."); return; }

    // --- NOVO: Verificação ---
    const hasNotified = checkForExistingNotifications(gruposParaNotificar);

    if (hasNotified) {
       setConfirmMessage("Alguns dos alunos/dias selecionados já foram notificados. Deseja reenviar a notificação por e-mail?");
      // Armazena a ação que deve ser executada se o usuário confirmar
      setConfirmAction(() => () => proceedWithEmail(gruposParaNotificar));
      setShowConfirmModal(true);
    } else {
      // Se ninguém foi notificado, prossegue direto
      proceedWithEmail(gruposParaNotificar);
    }
  };

// --- Função: Inicia envio de Email (CORRIGIDA - Toast Único) ---
  // (Sem alterações nesta função)
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

        // Atualiza a tabela principal
        if (idsSucesso.length > 0) {
            
          // --- MODIFICADO: Lógica de atualização do estado local ---
          setAlunosAusentes(prev => prev.map(a => {
            if (!idsSucesso.includes(a.frequencia_id)) return a;

            // Replica a lógica do backend no estado local
            const statusAntigo = a.notificacao_status;
            let statusNovo;
            if (statusAntigo === 'pendente') {
              statusNovo = 'notificado_email';
            } else if (!statusAntigo.includes('notificado_email')) {
              statusNovo = `${statusAntigo},notificado_email`;
            } else {
              statusNovo = statusAntigo; // Já estava lá
            }
            return { ...a, notificacao_status: statusNovo };
          }));
          
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
    // (Sem alterações)
    if (cancelTimerRef.current) { clearInterval(cancelTimerRef.current); cancelTimerRef.current = null; }
    
    emailJobRef.current = null; // <--- ADICIONE ISSO (Limpa o job pendente)

    setShowEmailStatusModal(false); setEmailStatusList([]); setCountdown(5);
    setShowCancelCountdown(false); setIsSendingEmail(false);
    toast.warn("Envio cancelado.");
  };

  // --- Ação: Abrir Modal de Detalhes ---
  const handleShowDetails = (grupo) => {
    // (Sem alterações)
    setDetailsData(grupo); // Guarda o grupo clicado
    setShowDetailsModal(true); // Abre o modal
  };

  // Efeito para limpar o timer
  useEffect(() => { return () => { if (cancelTimerRef.current) { clearInterval(cancelTimerRef.current); cancelTimerRef.current = null; } }; }, []);

  // --- Efeito: Observa o countdown para disparar o envio de email ---
  useEffect(() => {
    // (Sem alterações)
    if (countdown > 0 || !showCancelCountdown) {
      return;
    }
    if (cancelTimerRef.current) {
      clearInterval(cancelTimerRef.current);
      cancelTimerRef.current = null;
    }
    setShowCancelCountdown(false);
    if (emailJobRef.current) {
      const { ids, grupos } = emailJobRef.current;
      startEmailSendingProcess(ids, grupos);
      emailJobRef.current = null; 
    }
  }, [countdown, showCancelCountdown]); 

  // Contagem de grupos selecionados
  const numSelecionados = Object.values(selecionados).filter(Boolean).length;

// --- NOVA FUNÇÃO ---
// Função auxiliar para ANEXAR (Fluxos de WhatsApp/Email)
const appendarStatusNotificacao = async (frequencia_ids, statusParaAdicionar) => {
  if (!Array.isArray(frequencia_ids) || frequencia_ids.length === 0) {
    console.warn("appendarStatusNotificacao chamado sem IDs válidos.");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:5001/api/frequencia/notificacao/append', { // <-- Novo Endpoint de ANEXAR
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ frequencia_ids, status: statusParaAdicionar })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
      toast.error(`Erro ${response.status} ao anexar status: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    toast.error(`Falha de conexão ao anexar status: ${error.message}`);
  }
};




// --- Renderização ---
  return (
    <Container className="py-4"> {/* Padding ajustado */}
      <motion.div initial="hidden" animate="visible" variants={animationVariants}>
        <h2 className="text-center mb-4">Notificar Ausências</h2>

        {/* --- Card de Filtros (Responsivo) --- */}
        <Card className="shadow-sm p-3 p-md-4 mb-4">
            <Row className="g-3 align-items-end">
                {/* Inputs ocupam 100% no mobile (xs=12) e dividem espaço no PC (md) */}
                <Col xs={12} md={6} lg={3}>
                    <Form.Label>Turma (*)</Form.Label>
                    <Form.Select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}>
                        <option value="">Selecione...</option>
                        {turmas.map(t => (<option key={t.id} value={t.id}>{t.nome}</option>))}
                    </Form.Select>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <Form.Label>Disciplina</Form.Label>
                    <Form.Select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)}>
                        <option value="">Todas</option>
                        {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                    </Form.Select>
                </Col>
                <Col xs={6} md={4} lg={3}>
                    <Form.Label>Data Inicial (*)</Form.Label>
                    <Form.Control type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
                </Col>
                <Col xs={6} md={4} lg={2}>
                    <Form.Label>Data Final (*)</Form.Label>
                    <Form.Control type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
                </Col>
                <Col xs={12} md={4} lg={1}>
                    <Button variant="primary" onClick={handleBuscarAusentes} className="w-100" disabled={loading} title="Buscar">
                        <i className="bi bi-search"></i>
                    </Button>
                </Col>
            </Row>

             <Collapse in={buscaRealizada && faltasAgrupadas.length > 0}>
                 <div className="mt-4 pt-3 border-top">
                     <Row className="align-items-center g-3">
                         <Col xs={12} md={5} lg={6} className="text-center text-md-start">
                           <strong>{numSelecionados} dia(s) selecionado(s)</strong>
                         </Col>
                         
                         {/* Botões de Ação: Grid no Mobile, Flex no Desktop */}
                         <Col xs={12} md={7} lg={6}>
                             <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <Button variant="success" onClick={handleNotificarWhatsApp} disabled={numSelecionados === 0}> 
                                    <i className="bi bi-whatsapp me-2"></i>WhatsApp 
                                </Button>
                                <Button variant="info" onClick={handleNotificarEmail} disabled={numSelecionados === 0 || isSendingEmail || showCancelCountdown}>
                                    {(isSendingEmail || showCancelCountdown) ? <Spinner as="span" animation="border" size="sm" /> : <i className="bi bi-envelope me-2"></i>} E-mail
                                </Button>
                                <Dropdown onSelect={(status) => alterarStatusEmMassa(status)} className="d-grid d-md-inline-block">
                                   <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-options" disabled={numSelecionados === 0} className="w-100"/>
                                       <Dropdown.Menu>
                                         <Dropdown.Header>Alterar status</Dropdown.Header>
                                         <Dropdown.Item eventKey="pendente">Pendente</Dropdown.Item>
                                         <Dropdown.Item eventKey="notificado_whatsapp">Notif. WhatsApp</Dropdown.Item>
                                         <Dropdown.Item eventKey="notificado_email">Notif. E-mail</Dropdown.Item>
                                       </Dropdown.Menu>
                                </Dropdown>
                             </div>
                         </Col>
                     </Row>
                 </div>
             </Collapse>
        </Card>

        {/* --- Card de Resultados --- */}
        <AnimatePresence>
          {buscaRealizada && (
            <motion.div key="resultados" variants={animationVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 py-3">
                  <span className="fw-bold fs-5">Resultados</span>
                  {faltasAgrupadas.length > 0 && (
                    <Form.Control 
                        type="text" 
                        placeholder="Filtrar por nome..." 
                        value={filtroNome} 
                        onChange={(e) => setFiltroNome(e.target.value)} 
                        style={{ maxWidth: '100%', width: '300px' }} 
                    />
                  )}
                </Card.Header>
                <Card.Body className="p-0 p-md-3"> {/* Remove padding no mobile para aproveitar espaço */}
                  {loading ? ( <div className="text-center p-4"><Spinner /></div>
                  ) : faltasAgrupadas.length === 0 ? (
                    <div className="text-center text-muted p-4">Nenhuma falta encontrada.</div>
                  ) : faltasAgrupadasFiltradas.length === 0 ? (
                    <div className="text-center text-muted p-4">Nenhum aluno com o nome "{filtroNome}".</div>
                  ) : (
                    <>
                    {/* --- VERSÃO DESKTOP (TABELA) --- */}
                    <div className="d-none d-md-block">
                        <Table hover responsive>
                        <thead>
                            <tr>
                            <th style={{ width: '50px' }}><Form.Check type="checkbox" title="Selecionar Todos" checked={selectAll} onChange={handleSelectAll}/></th>
                            <th>Aluno</th>
                            <th>Responsável</th>
                            <th>Data da Falta</th>
                            <th>Contato</th>
                            <th className="text-center">Status</th>
                            <th className="text-center" style={{width: '90px'}}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                                {faltasAgrupadasFiltradas.map(grupo => {
                                    // Lógica de Status (Copiada para consistência)
                                    const statusUnicos = new Set(grupo.faltas.map(f => f.notificacao_status));
                                    let statusConsolidado = 'Pendente'; let statusVariant = 'warning';
                                    if (statusUnicos.size === 1) {
                                        const unicoStatus = statusUnicos.values().next().value;
                                        if (unicoStatus !== 'pendente') {
                                            const hasWhats = unicoStatus.includes('whatsapp');
                                            const hasEmail = unicoStatus.includes('email');
                                            if (hasWhats && hasEmail) { statusConsolidado = 'Wpp/Email'; statusVariant = 'primary'; }
                                            else if (hasWhats) { statusConsolidado = 'WhatsApp'; statusVariant = 'success'; }
                                            else if (hasEmail) { statusConsolidado = 'Email'; statusVariant = 'info'; }
                                            else { statusConsolidado = unicoStatus; statusVariant = 'secondary'; }
                                        }
                                    } else if (statusUnicos.size > 1) { statusConsolidado = 'Misto'; statusVariant = 'secondary'; }
                                    
                                    return (
                                    <tr key={grupo.chaveUnica} className={!!selecionados[grupo.chaveUnica] ? 'table-active' : ''}>
                                        <td><Form.Check type="checkbox" checked={!!selecionados[grupo.chaveUnica]} onChange={() => toggleSelecionado(grupo.chaveUnica)}/></td>
                                        <td>{grupo.aluno_nome}</td>
                                        <td>{grupo.responsavel_nome || <span className="text-muted">N/I</span>}</td>
                                        <td>{new Date(grupo.data_aula + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                        <td>{grupo.responsavel_celular || grupo.responsavel_email || <span className="text-muted">N/I</span>}</td>
                                        <td className="text-center"> <Badge bg={statusVariant}>{statusConsolidado}</Badge> </td>
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
                    </div>

                    {/* --- VERSÃO MOBILE (CARDS) --- */}
                    <div className="d-md-none bg-light">
                        {/* Checkbox "Selecionar Todos" no Mobile */}
                        <div className="p-3 bg-white border-bottom d-flex align-items-center mb-2">
                             <Form.Check type="checkbox" checked={selectAll} onChange={handleSelectAll} label="Selecionar Todos da Lista" className="fw-bold"/>
                        </div>

                        {faltasAgrupadasFiltradas.map(grupo => {
                             // Mesma lógica de status para os Cards
                             const statusUnicos = new Set(grupo.faltas.map(f => f.notificacao_status));
                             let statusConsolidado = 'Pendente'; let statusVariant = 'warning';
                             if (statusUnicos.size === 1) {
                                 const unicoStatus = statusUnicos.values().next().value;
                                 if (unicoStatus !== 'pendente') {
                                     const hasWhats = unicoStatus.includes('whatsapp');
                                     const hasEmail = unicoStatus.includes('email');
                                     if (hasWhats && hasEmail) { statusConsolidado = 'Wpp/Email'; statusVariant = 'primary'; }
                                     else if (hasWhats) { statusConsolidado = 'WhatsApp'; statusVariant = 'success'; }
                                     else if (hasEmail) { statusConsolidado = 'Email'; statusVariant = 'info'; }
                                     else { statusConsolidado = unicoStatus; statusVariant = 'secondary'; }
                                 }
                             } else if (statusUnicos.size > 1) { statusConsolidado = 'Misto'; statusVariant = 'secondary'; }

                            return (
                                <Card key={grupo.chaveUnica} className={`mb-3 mx-2 shadow-sm border-0 ${!!selecionados[grupo.chaveUnica] ? 'border border-2 border-primary' : ''}`}>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex gap-2">
                                                <Form.Check 
                                                    type="checkbox" 
                                                    style={{ transform: 'scale(1.2)' }}
                                                    checked={!!selecionados[grupo.chaveUnica]} 
                                                    onChange={() => toggleSelecionado(grupo.chaveUnica)}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-0">{grupo.aluno_nome}</h6>
                                                    <small className="text-muted">
                                                        {new Date(grupo.data_aula + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                    </small>
                                                </div>
                                            </div>
                                            <Badge bg={statusVariant}>{statusConsolidado}</Badge>
                                        </div>
                                        
                                        <div className="ms-4 ps-2 border-start">
                                            <p className="mb-1 small text-muted">Resp: <span className="text-dark">{grupo.responsavel_nome || 'N/I'}</span></p>
                                            <p className="mb-0 small text-muted">Contato: <span className="text-dark">{grupo.responsavel_celular || grupo.responsavel_email || 'N/I'}</span></p>
                                        </div>

                                        <div className="d-grid mt-3">
                                            <Button variant="outline-secondary" size="sm" onClick={() => handleShowDetails(grupo)}>
                                                <i className="bi bi-list-ul me-2"></i> Ver Detalhes / Disciplinas
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )
                        })}
                    </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- MODAL DA FILA WHATSAPP (Estrutura Mantida) --- */}
      {/* (Sem alterações no JSX do modal WhatsApp) */}
      <Modal show={showFilaModalWhats} onHide={handleCancelarFilaWhats} backdrop="static" keyboard={false} centered size="lg" scrollable>
        <Modal.Header closeButton><Modal.Title>Fila de Notificação - WhatsApp</Modal.Title></Modal.Header>
        {filaNotificacaoWhats.length > 0 && filaNotificacaoWhats[indiceFilaWhats] ? (
          <>
            <Modal.Body>
              <Alert variant="danger" className="py-2">
                  <small><i className="bi bi-exclamation-triangle-fill me-1"></i> Envios em massa rápidos podem bloquear seu WhatsApp. Use com moderação.</small>
              </Alert>
              <AnimatePresence mode="wait">
                <motion.div key={indiceFilaWhats} variants={modalContentVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} >
                  <Card bg="light" className="mb-3 border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="mb-1 fw-bold">{filaNotificacaoWhats[indiceFilaWhats].aluno_nome}</h5>
                        <Badge bg="primary" pill>{indiceFilaWhats + 1} / {filaNotificacaoWhats.length}</Badge>
                      </div>
                      <div className="text-muted small mb-2">Responsável: {filaNotificacaoWhats[indiceFilaWhats].responsavel_nome || 'N/I'}</div>
                      
                      <div className="d-flex align-items-center gap-2">
                        {filaNotificacaoWhats[indiceFilaWhats].responsavel_celular ? ( 
                            <> 
                                <span className="fw-bold text-success"><i className="bi bi-whatsapp"></i> {filaNotificacaoWhats[indiceFilaWhats].responsavel_celular}</span> 
                                <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => copyToClipboard(filaNotificacaoWhats[indiceFilaWhats].responsavel_celular.replace(/\D/g, ''), "Copiado!")}> <i className="bi bi-clipboard"></i></Button> 
                            </> 
                        ) : ( <span className="text-danger">Sem celular cadastrado</span> )}
                      </div>
                    </Card.Body>
                  </Card>
                  <Form.Group>
                    <Form.Label className="fw-bold small">Mensagem:</Form.Label>
                    <Form.Control as="textarea" rows={5} value={mensagemAtualWhats} readOnly style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }} />
                    <Button variant="outline-secondary" size="sm" className="mt-2" onClick={() => copyToClipboard(mensagemAtualWhats, "Mensagem copiada!")} > <i className="bi bi-clipboard me-2"></i> Copiar Texto </Button>
                  </Form.Group>
                </motion.div>
              </AnimatePresence>
            </Modal.Body>
            <Modal.Footer className="d-flex flex-column flex-md-row gap-2">
               <div className="d-flex gap-2 w-100 justify-content-between order-2 order-md-1">
                    <Button variant="secondary" onClick={handleCancelarFilaWhats} disabled={isSavingWhats}>Cancelar</Button>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" onClick={handleVoltarAoAnteriorWhats} disabled={indiceFilaWhats === 0 || isSavingWhats} ><i className="bi bi-arrow-left"></i></Button>
                        <Button variant="outline-warning" onClick={handleIgnorarAtualWhats} disabled={isSavingWhats}>Ignorar</Button>
                    </div>
               </div>
               <div className="d-flex gap-2 w-100 justify-content-end order-1 order-md-2">
                    <Button variant="success" className="flex-grow-1 flex-md-grow-0" onClick={handleEnviarNotificacaoAtualWhats} disabled={isSavingWhats}> <i className="bi bi-whatsapp me-2"></i> Enviar </Button>
                    <Button variant="primary" className="flex-grow-1 flex-md-grow-0" onClick={handleProximoDaFilaWhats} disabled={isSavingWhats}>
                        {isSavingWhats ? <Spinner as="span" size="sm" /> : (indiceFilaWhats === filaNotificacaoWhats.length - 1) ? "Concluir" : "Próximo"} <i className="bi bi-arrow-right ms-1"></i>
                    </Button>
               </div>
            </Modal.Footer>
          </>
        ) : ( <Modal.Body> <Spinner size="sm" /> Carregando... </Modal.Body> )}
      </Modal>

      {/* --- MODAL DE STATUS DE EMAIL --- */}
      {/* (Sem alterações no JSX do modal de Email) */}
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
      {/* (Sem alterações no JSX do modal de Detalhes) */}
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
                                
                                {/* --- MODIFICADO: Lógica de Badge Individual --- */}
                                <Badge bg={getStatusVariant(falta.notificacao_status)} pill>
                                  {
                                    (falta.notificacao_status.includes('whatsapp') && falta.notificacao_status.includes('email')) ? 'Wpp/Email' :
                                    (falta.notificacao_status.includes('whatsapp')) ? 'WhatsApp' :
                                    (falta.notificacao_status.includes('email')) ? 'Email' :
                                    (falta.notificacao_status === 'pendente') ? 'Pendente' :
                                    falta.notificacao_status
                                  }
                                </Badge>
                                {/* --- FIM DA MODIFICAÇÃO --- */}
                                
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

     {/* --- NOVO: MODAL DE CONFIRMAÇÃO DE REENVIO --- */}
     <ModalConfirmacao
       show={showConfirmModal}
       onHide={() => {
         setShowConfirmModal(false);
         setConfirmAction(null); // Limpa a ação
       }}
       onConfirm={() => {
         if (typeof confirmAction === 'function') {
           confirmAction(); // Executa a ação armazenada (WhatsApp ou Email)
         }
         setShowConfirmModal(false);
         setConfirmAction(null); // Limpa a ação
       }}
       title="Confirmação de Reenvio"
       message={confirmMessage}
       confirmText="Sim, Reenviar"
       cancelText="Não, Cancelar"
       confirmVariant="warning" // Um aviso é bom para reenvio
     />

    </Container>
  );
  }