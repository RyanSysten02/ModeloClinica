import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge, Form, Stack, Button, Tabs, Tab, Accordion, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
// CORREÇÃO: Removida a extensão .js dos imports
import TurmaService from '../../services/Turma';
import DisciplinaService from '../../services/Disciplina';
// AGORA IMPORTAMOS AS DUAS FUNÇÕES (sem .js)
import { gerarDadosMatriz, getProfessoresSubstitutosPriorizados } from './AnaliseSubstituicaoUtils';

// --- NOVO: Imports para Gerar PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// -------------------------------------

// Hook para o Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api',
});
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
}, error => Promise.reject(error));

/**
 * CSS para o Heatmap E IMPRESSÃO
 */
const MatrizEstilos = `
  /* Estilos da Matriz */
  .matriz-resiliencia .table {
    border-collapse: separate;
    border-spacing: 0;
    overflow-x: auto; 
  }
  .matriz-resiliencia th:first-child,
  .matriz-resiliencia td:first-child {
    position: sticky;
    left: 0;
    background-color: #f8f9fa !important; 
    z-index: 1;
    min-width: 180px; 
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  }
  .matriz-resiliencia th {
    vertical-align: bottom;
    text-align: center;
    font-size: 0.9em;
    padding-bottom: 0.5rem;
  }
  .matriz-resiliencia .professor-header {
    height: 140px;
    white-space: nowrap;
    text-align: left;
    /* REMOVIDO: cursor: pointer; */
    transition: background-color 0.2s;
  }
  /* REMOVIDO: Seletor :hover */
  .matriz-resiliencia .professor-header > div {
    transform: rotate(-60deg);
    transform-origin: bottom left;
    width: 30px; 
    position: relative;
    left: 20px; 
    bottom: 5px;
  }
  .matriz-resiliencia .professor-header span {
      display: inline-block;
      padding-left: 5px; 
      font-weight: 500;
  }
  .matriz-celula {
    text-align: center;
    font-weight: bold;
    font-size: 0.85em;
    padding: 0.5rem 0.25rem !important;
    cursor: default;
    transition: opacity 0.3s;
  }
  
  /* REMOVIDO: Estilos .professor-ausente e .celula-ausente */

  .celula-P1 { background-color: #0d6efd !important; color: white !important; }
  .celula-P1-AI   { background-color: #0a58ca !important; color: white !important; }
  .celula-P2       { background-color: #198754 !important; color: white !important; }
  .celula-P2-AI   { background-color: #146c43 !important; color: white !important; }
  .celula-P3       { background-color: #ffc107 !important; color: black !important; }
  .celula-P4       { background-color: #fd7e14 !important; color: black !important; }
  .celula-N\\/A   { background-color: #f1f1f1 !important; color: #aaa !important; }
  
  /* --- REMOVIDO: O bloco @media print foi removido --- */
  /* O CSS para impressão do simulador foi removido 
     pois agora ele usa exportação PDF. */
`;

// Dados para a Legenda (Usado na Matriz e no PDF)
const legendaItens = [
    { id: 'P1', cor: '#0d6efd', texto: 'Titular (P1) da Área', corTexto: '#FFFFFF' },
    { id: 'P2', cor: '#198754', texto: 'P2: Docente (Outra Área)', corTexto: '#FFFFFF' },
    { id: 'P3', cor: '#ffc107', texto: 'P3: Coordenador (Mesma Área)', corTexto: '#000000' },
    { id: 'P4', cor: '#fd7e14', texto: 'P4: Coordenador (Outra Área)', corTexto: '#000000' },
    { id: 'P1-AI', cor: '#0a58ca', texto: 'P1 (Anos Iniciais): Colaborativo', corTexto: '#FFFFFF' },
    { id: 'P2-AI', cor: '#146c43', texto: 'P2 (Anos Iniciais): Coord. Linguagens', corTexto: '#FFFFFF' }, // 'id' corrigido
    { id: 'N/A', cor: '#f1f1f1', texto: 'Não Aplicável', corTexto: '#888888' },
];
// --- Mapa de cores para o PDF ---
const pdfColorMap = legendaItens.reduce((acc, item) => {
    acc[item.id] = { fill: item.cor, text: item.corTexto };
    return acc;
}, {});

// --- Componente Filho para o Simulador Tático ---
function SimuladorTatico({ todosProfessoresDB }) {
    
    const [selectedProfessorId, setSelectedProfessorId] = useState('');

    // Lógica para simular a aula e encontrar substitutos
    const listaPriorizada = useMemo(() => {
        if (!selectedProfessorId) return [];
        const professorAusente = todosProfessoresDB.find(p => p.id === parseInt(selectedProfessorId));
        if (!professorAusente) return [];
        let nivel = 'Anos Finais';
        if (professorAusente.areaConhecimento === 'Pedagógico (Anos Iniciais)' || professorAusente.tipo === 'colaborativo') {
            nivel = 'Anos Iniciais';
        }
        const mockAlocacao = {
            professorAtual: professorAusente,
            disciplina: { areaConhecimento: professorAusente.areaConhecimento },
            turma: { nivel: nivel }
        };
        return getProfessoresSubstitutosPriorizados(mockAlocacao, todosProfessoresDB);
    }, [selectedProfessorId, todosProfessoresDB]);

    // --- ATUALIZADO: Handler de Impressão para PDF (Simulador) ---
    const handlePrintSimulador = () => {
        if (!selectedProfessorId) {
            toast.warn("Por favor, selecione um professor ausente primeiro.");
            return;
        }
        
        const professorAusente = todosProfessoresDB.find(p => p.id === parseInt(selectedProfessorId));
        if (!professorAusente) {
            toast.error("Erro ao encontrar dados do professor.");
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            const today = new Date().toLocaleDateString('pt-BR');

            // --- Título e Subtítulo ---
            doc.setFontSize(16);
            doc.text('Simulador de Ausência', pageWidth / 2, 40, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Gerado em: ${today}`, pageWidth / 2, 55, { align: 'center' });

            // --- Informações do Professor Ausente ---
            doc.setFontSize(12);
            doc.setTextColor(0);
            autoTable(doc, {
                startY: 70,
                theme: 'plain',
                body: [
                    ['Professor Ausente:', professorAusente.nome],
                    ['Área de Conhecimento:', professorAusente.areaConhecimento || 'N/A'],
                    ['Carga Horária:', `${professorAusente.cargaHoraria}h`],
                ],
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 
                    0: { fontStyle: 'bold', cellWidth: 120 },
                    1: { cellWidth: 'auto' }
                }
            });

            let finalY = doc.lastAutoTable.finalY;

            // --- Tabela de Substitutos ---
            doc.setFontSize(12);
            doc.text('Lista de Substitutos Priorizados', 40, finalY + 30);
            
            const pdfHead = ['Nome do Substituto', 'Tipo', 'Área de Conhecimento', 'C/H'];
            const pdfBody = [];

            listaPriorizada.forEach(grupo => {
                if (grupo.opcoes.length > 0) {
                    // Linha de "Header" do Grupo
                    pdfBody.push([
                        { 
                            content: grupo.label, 
                            colSpan: 4, 
                            styles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'left' } 
                        }
                    ]);
                    
                    // Linhas dos professores
                    grupo.opcoes.forEach(p => {
                        pdfBody.push([
                            p.nome,
                            p.tipo,
                            p.areaConhecimento || 'N/A',
                            { content: `${p.cargaHoraria}h`, styles: { halign: 'right' } }
                        ]);
                    });
                }
            });

            // Caso não haja nenhum substituto
            if (pdfBody.length === 0) {
                pdfBody.push([
                    { content: 'Nenhum substituto encontrado.', colSpan: 4, styles: { halign: 'center' } }
                ]);
            }

            autoTable(doc, {
                head: [pdfHead],
                body: pdfBody,
                startY: finalY + 40,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
                headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 150 },
                    1: { cellWidth: 80 },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 40, halign: 'right' }
                },
                didDrawPage: (data) => {
                    // Numeração de página
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(
                        `Página ${data.pageNumber} de ${pageCount}`,
                        pageWidth / 2,
                        pageHeight - 15,
                        { align: 'center' }
                    );
                }
            });

            // 4. Salvar o PDF
            doc.save(`simulador_tatico_${professorAusente.nome.replace(/ /g, '_')}_${today.replace(/\//g, '-')}.pdf`);

        } catch (err) {
            console.error("Erro ao gerar PDF do simulador:", err);
            toast.error("Falha ao gerar o PDF. Verifique o console.");
        }
    };

    return (
        <Card id="card-simulador-tatico">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Simulador de Ausência</h5>
                {/* ATUALIZADO: O botão agora chama a função de PDF e tem um ícone de PDF */}
                <Button variant="outline-danger" size="sm" onClick={handlePrintSimulador} className="btn-print">
                    <i className="bi bi-file-earmark-pdf me-2"></i>Gerar PDF
                </Button>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold fs-5">1. Selecione o Professor Ausente:</Form.Label>
                            <Form.Select 
                                size="lg" 
                                value={selectedProfessorId} 
                                // CORREÇÃO AQUI: e.targe -> e.target
                                onChange={(e) => setSelectedProfessorId(e.target.value)}
                            >
                                <option value="">Selecione um professor...</option>
                                {todosProfessoresDB
                                    .sort((a,b) => a.nome.localeCompare(b.nome))
                                    .map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} ({p.tipo} - {p.areaConhecimento || 'N/A'} - {p.cargaHoraria}h)
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <h5 className="fw-bold fs-5">2. Lista de Substitutos Priorizados:</h5>
                        {selectedProfessorId ? (
                            listaPriorizada.length > 0 ? (
                                <Accordion defaultActiveKey="0" alwaysOpen>
                                    {listaPriorizada.map((grupo, idx) => (
                                        <Accordion.Item eventKey={String(idx)} key={grupo.label}>
                                            <Accordion.Header>
                                                <span className="fw-bold">{grupo.label}</span>
                                            </Accordion.Header>
                                            <Accordion.Body className="p-0">
                                                <ListGroup variant="flush">
                                                    {grupo.opcoes.map(p => (
                                                        <ListGroup.Item key={p.id}>
                                                            <div className="d-flex justify-content-between">
                                                                <strong>{p.nome}</strong>
                                                                <Badge bg="secondary">{p.cargaHoraria}h</Badge>
                                                            </div>
                                                            <small className="text-muted">
                                                                {p.tipo} - {p.areaConhecimento || 'N/A'}
                                                            </small>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            ) : (
                                <Alert variant="warning">Nenhum substituto encontrado para este professor com base nas regras.</Alert>
                            )
                        ) : (
                            <Alert variant="info">Selecione um professor para ver a lista de substitutos.</Alert>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

// --- Componente Filho para a Matriz Estratégica ---
function MatrizEstrategica({ dadosMatriz, legendaItens }) {
    
    // --- ATUALIZADO: Handler de Impressão da Matriz (PDF) ---
    const handlePrintMatriz = () => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: 'a4'
            });
            const pageHeight = doc.internal.pageSize.height;

            // --- MELHORIA: Título e Subtítulo ---
            doc.setFontSize(14);
            doc.text('Matriz de Resiliência Estratégica', 40, 40);
            const today = new Date().toLocaleDateString('pt-BR');
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Gerado em: ${today}`, 40, 55);

            // 1. Preparar Cabeçalho (Head)
            const pdfHead = [
                ['Área / Nível', ...dadosMatriz.colunas.map(c => `${c.nome} (${c.cargaHoraria}h)`)]
            ];

            // 2. Preparar Corpo (Body)
            const pdfBody = dadosMatriz.linhas.map(linha => [
                linha.nome, 
                ...linha.celulas.map(celula => {
                    // REMOVIDO: A verificação de 'professoresAusentes' foi removida
                    return celula.prioridade.id;
                })
            ]);

            // 3. Gerar a Tabela Principal
            autoTable(doc, {
                head: pdfHead,
                body: pdfBody,
                startY: 70, // Posição abaixo do subtítulo
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    // MELHORIA: Centraliza todo o texto por padrão
                    halign: 'center',
                    valign: 'middle'
                },
                columnStyles: {
                    // Deixa a primeira coluna (Áreas) alinhada à esquerda
                    0: { halign: 'left', fontStyle: 'bold' }
                },
                headStyles: {
                    fillColor: [41, 128, 185], 
                    textColor: [255, 255, 255],
                    fontSize: 6,
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                // Hook para colorir as células
                didDrawCell: (data) => {
                    const cellText = data.cell.text[0];
                    let color = pdfColorMap[cellText];
                    
                    if (color && data.section === 'body' && data.column.index > 0) {
                        doc.setFillColor(color.fill);
                        doc.setTextColor(color.text);
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                        
                        doc.text(
                            cellText, 
                            data.cell.x + data.cell.width / 2, 
                            data.cell.y + data.cell.height / 2, 
                            { halign: 'center', valign: 'middle' }
                        );
                    }
                },
                // --- MELHORIA: Adiciona numeração de página ---
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(
                        `Página ${data.pageNumber} de ${pageCount}`, 
                        doc.internal.pageSize.width / 2, 
                        pageHeight - 15, // Posição no rodapé
                        { align: 'center' }
                    );
                }
            });

            // --- MELHORIA: Adicionar Legenda ao PDF ---
            const finalY = doc.lastAutoTable.finalY;
            let legendStartY = finalY + 40; // Posição inicial da legenda

            // Verifica se a legenda caberá na página atual, se não, adiciona uma nova
            if (legendStartY > pageHeight - 80) { // 80 de margem inferior
                doc.addPage();
                legendStartY = 40; // Posição no topo da nova página
            }

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text('Legenda', 40, legendStartY);

            const legendHead = [['ID', 'Descrição']];
            const legendBody = legendaItens.map(item => [item.id, item.texto]);

            autoTable(doc, {
                head: legendHead,
                body: legendBody,
                startY: legendStartY + 10,
                theme: 'grid',
                styles: { fontSize: 8, valign: 'middle' },
                headStyles: { fillColor: [100, 100, 100] },
                columnStyles: {
                    0: { halign: 'center' }, // Coluna 'ID'
                    1: { halign: 'left' }  // Coluna 'Descrição'
                },
                // Hook para colorir as células da legenda
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.column.index === 0) {
                        const cellText = data.cell.text[0];
                        const color = pdfColorMap[cellText];
                        if (color) {
                            doc.setFillColor(color.fill);
                            doc.setTextColor(color.text);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                            doc.text(
                                cellText,
                                data.cell.x + data.cell.width / 2,
                                data.cell.y + data.cell.height / 2,
                                { halign: 'center', valign: 'middle' }
                            );
                        }
                    }
                }
            });

            // 4. Salvar o PDF
            doc.save(`matriz_resiliencia_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            toast.error("Falha ao gerar o PDF. Verifique o console.");
        }
    };
    
    return (
        <Card>
            <Card.Body className="matriz-resiliencia">
                <Alert variant="info" className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-info-circle fs-4 me-3"></i>
                        <div>
                            <Alert.Heading as="h6" className="mb-1">Como usar esta matriz:</Alert.Heading>
                            <small>
                                {/* TEXTO ATUALIZADO */}
                                Use os filtros acima para definir o contexto. Esta matriz mostra a
                                <strong> resiliência estratégica</strong> da alocação de professores.
                            </small>
                        </div>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={handlePrintMatriz} className="ms-3 btn-print">
                        <i className="bi bi-file-earmark-pdf me-2"></i>Gerar PDF
                    </Button>
                </Alert>

                <Table responsive striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Área / Nível</th>
                            {dadosMatriz.colunas.map(prof => (
                                <th 
                                    key={prof.id} 
                                    // CORREÇÃO: Classes, title e onClick removidos
                                    className={`professor-header`}
                                >
                                    <div className="professor-header-content">
                                        <Badge pill bg="dark" text="light" className="me-1">{prof.cargaHoraria}h</Badge>
                                        <span>{prof.nome}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dadosMatriz.linhas.length === 0 && (
                            <tr>
                                <td colSpan={dadosMatriz.colunas.length + 1} className="text-center text-muted p-4">
                                    Nenhuma área/nível encontrada para os filtros de período selecionados.
                                </td>
                            </tr>
                        )}
                        {dadosMatriz.linhas.map(linha => (
                            <tr key={linha.id}>
                                <td className="fw-bold">{linha.nome}</td>
                                {linha.celulas.map(celula => (
                                    <td 
                                        key={`${linha.id}-${celula.professorId}`}
                                        // CORREÇÃO: Classe de ausência removida
                                        className={`matriz-celula celula-${celula.prioridade.id.replace('/', '\\/')}`}
                                        title={celula.prioridade.tooltip}
                                    >
                                        {celula.prioridade.label.split(' ')[0]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
            <Card.Footer className="bg-light p-3">
                <h5 className="mb-2">Legenda da Matriz</h5>
                <Row className="g-3 align-items-center">
                    {legendaItens.map(item => (
                        <Col xs="auto" key={item.id}>
                            <Badge 
                                bg="" /* Correção da cor da legenda */
                                style={{ 
                                    backgroundColor: item.cor, 
                                    color: item.corTexto || 'white',
                                    minWidth: '60px',
                                    fontSize: '0.8em'
                                }} 
                                className="me-1 p-2"
                            >
                                {item.id}
                            </Badge>
                            <span className="small align-middle">{item.texto}</span>
                        </Col>
                    ))}
                </Row>
            </Card.Footer>
        </Card>
    );
}


// --- COMPONENTE PRINCIPAL (Atualizado com Abas) ---
export default function TelaAnaliseSubstituicao() {
    // --- Estados ---
    const [todosProfessoresDB, setTodosProfessoresDB] = useState([]);
    const [disciplinasFiltro, setDisciplinasFiltro] = useState([]);
    const [turmasFiltro, setTurmasFiltro] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anosLetivos, setAnosLetivos] = useState([]);
    const [semestres, setSemestres] = useState([]);
    const [filtros, setFiltros] = useState({
        tipos: ['docente', 'coordenador', 'colaborativo'], 
        sortBy: 'cargaHoraria', 
        anoLetivo: '',
        semestre: ''
    });
    
    // REMOVIDO: O state 'professoresAusentes' foi removido

    // --- Hooks de Efeito ---
    useEffect(() => {
        const styleTag = document.createElement("style");
        styleTag.id = "matriz-resiliencia-styles";
        styleTag.innerHTML = MatrizEstilos;
        document.head.appendChild(styleTag);
        return () => { 
            const styleElement = document.getElementById("matriz-resiliencia-styles");
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, []); 

   useEffect(() => {
        const carregarDadosIniciais = async () => {
            setIsLoading(true);
            try {
                const [professoresData, turmasData, disciplinasData] = await Promise.all([
                    apiClient.get('/professor/professores'),
                    TurmaService.findAll(),
                    DisciplinaService.findAll()
                ]);
                const turmas = Array.isArray(turmasData) ? turmasData : [];
                setTodosProfessoresDB(professoresData.data || []);
                setTurmasFiltro(turmas);
                setDisciplinasFiltro(Array.isArray(disciplinasData) ? disciplinasData : []);

                // --- ALTERAÇÃO AQUI: Garantir que anos e semestres sejam tratados como números ---
                const anos = [...new Set(turmas.map(t => parseInt(t.ano_letivo, 10)))]
                    .filter(ano => !isNaN(ano)) // Remove entradas inválidas
                    .sort((a, b) => b - a);
                
                const semestres = [...new Set(turmas.map(t => parseInt(t.semestre, 10)))]
                    .filter(sem => !isNaN(sem)) // Remove entradas inválidas
                    .sort();
                // -----------------------------------------------------------------------------

                setAnosLetivos(anos);
                setSemestres(semestres);

                // Define o "ano letivo atual" como o mais recente da lista
                const anoAtual = anos[0] || ''; 
                const semestreAtual = semestres[0] || '';

                setFiltros(prev => ({ 
                    ...prev, 
                    // Garantir que o valor salvo no estado seja número (ou string vazia)
                    anoLetivo: anoAtual, 
                    semestre: semestreAtual 
                }));
                setError(null);
            } catch (err) {
                toast.error("Falha ao carregar dados da matriz.");
                setError("Não foi possível carregar os dados necessários.");
            } finally {
                setIsLoading(false);
            }
        };
        carregarDadosIniciais();
    }, []);

    // --- Handlers ---
    const handleFiltroChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFiltros(prev => ({ ...prev, tipos: checked ? [...prev.tipos, value] : prev.tipos.filter(t => t !== value) }));
        } else {
            setFiltros(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // REMOVIDO: O handler 'toggleProfessorAusente' foi removido

    // --- Memo: Dados para a MATRIZ ---
 // --- Memo: Dados para a MATRIZ ---
    const dadosMatriz = useMemo(() => {
        if (todosProfessoresDB.length === 0 || disciplinasFiltro.length === 0 || turmasFiltro.length === 0) {
            return { linhas: [], colunas: [] };
        }

        // --- CORREÇÃO: Converter filtros para número antes de comparar ---
        // O valor '' (Todos) virará NaN
        const anoLetivoFiltro = parseInt(filtros.anoLetivo, 10);
        const semestreFiltro = parseInt(filtros.semestre, 10);

        const turmasProcessadas = turmasFiltro.filter(t => {
            // Converte os dados da turma para número
            const anoTurma = parseInt(t.ano_letivo, 10);
            const semestreTurma = parseInt(t.semestre, 10);

            // Comparações numéricas estritas
            // Se o filtro for NaN (ex: selecionou "Todos"), a condição isNaN() será true
            const matchAno = isNaN(anoLetivoFiltro) || anoTurma === anoLetivoFiltro;
            const matchSemestre = isNaN(semestreFiltro) || semestreTurma === semestreFiltro;
            
            return matchAno && matchSemestre;
        });
        
        const professoresFiltrados = todosProfessoresDB.filter(p => filtros.tipos.includes(p.tipo));
        
        professoresFiltrados.sort((a, b) => {
            if (filtros.sortBy === 'nome') return a.nome.localeCompare(b.nome);
            return a.cargaHoraria - b.cargaHoraria;
        });

        return gerarDadosMatriz(professoresFiltrados, disciplinasFiltro, turmasProcessadas);
    }, [todosProfessoresDB, disciplinasFiltro, turmasFiltro, filtros]);

    return (
        <Container fluid className="py-5 analise-substituicao-page"> 
            
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap btn-print">
                <Button as={Link} to="/pagSubstituicoes" variant="outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Voltar
                </Button>
                <h2 className="text-center mb-0 mx-auto">Análise de Substituições</h2>
                <div style={{ width: '130px' }} className="d-none d-lg-block"></div> 
            </div>

            <Tabs defaultActiveKey="simulador" id="analise-tabs" className="mb-3 btn-print" fill>
                
                {/* --- ABA 1: SIMULADOR TÁTICO --- */}
                <Tab eventKey="simulador" title={<span><i className="bi bi-person-check-fill me-2"></i>Simulador Ausências</span>}>
                    {isLoading ? (
                        <div className="text-center p-5"><Spinner animation="border" /></div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : (
                        <SimuladorTatico todosProfessoresDB={todosProfessoresDB} />
                    )}
                </Tab>
                
                {/* --- ABA 2: MATRIZ ESTRATÉGICA --- */}
                <Tab eventKey="matriz" title={<span><i className="bi bi-grid-3x3-gap-fill me-2"></i>Matriz Estratégica</span>}>
                    <Card className="shadow-sm">
                        <Card.Header className="p-3 btn-print">
                            <Row className="g-3">
                                {/* Filtros da Matriz */}
                                <Col md={5} lg={4}>
                                    <Form.Label className="fw-bold">Filtrar por Tipo:</Form.Label>
                                    <Stack direction="horizontal" gap={3}>
                                        <Form.Check inline label="Docentes" value="docente" id="check-docente" checked={filtros.tipos.includes('docente')} onChange={handleFiltroChange} name="tipos" />
                                        <Form.Check inline label="Coords." value="coordenador" id="check-coordenador" checked={filtros.tipos.includes('coordenador')} onChange={handleFiltroChange} name="tipos" />
                                        <Form.Check inline label="Colabs." value="colaborativo" id="check-colaborativo" checked={filtros.tipos.includes('colaborativo')} onChange={handleFiltroChange} name="tipos" />
                                    </Stack>
                                </Col>
                                <Col md={4} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Ano Letivo:</Form.Label>
                                        <Form.Select size="sm" name="anoLetivo" value={filtros.anoLetivo} onChange={handleFiltroChange}>
                                            <option value="">Todos</option>
                                            {anosLetivos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3} lg={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Semestre:</Form.Label>
                                        <Form.Select size="sm" name="semestre" value={filtros.semestre} onChange={handleFiltroChange}>
                                            <option value="">Todos</option> 
                                            {semestres.map(sem => <option key={sem} value={sem}>{sem}º Semestre</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Ordenar Professores por:</Form.Label>
                                        <Form.Select size="sm" name="sortBy" value={filtros.sortBy} onChange={handleFiltroChange}>
                                            <option value="cargaHoraria">Menor Carga Horária</option>
                                            <option value="nome">Nome (A-Z)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Header>

                        {isLoading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : error ? (
                            <Alert variant="danger">{error}</Alert>
                        ) : (
                            <MatrizEstrategica 
                                dadosMatriz={dadosMatriz}
                                legendaItens={legendaItens}
                                // Props removidas:
                                // professoresAusentes={professoresAusentes}
                                // toggleProfessorAusente={toggleProfessorAusente}
                            />
                        )}
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
}