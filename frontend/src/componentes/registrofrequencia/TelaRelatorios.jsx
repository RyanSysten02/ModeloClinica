import React, { useEffect, useState } from "react"; // 'React' importado
import { Accordion, Button, Card, Col, Container, Form, Row, Spinner, Table, ButtonGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import * as XLSX from "xlsx"; // Para Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Seus serviços existentes
import TurmaService from "../../services/Turma";
import DisciplinaService from '../../services/Disciplina';

// --- Funções Auxiliares ---
const formatPercent = (value) => {
    if (value === null || value === undefined) return "N/A";
    return `${parseFloat(value).toFixed(2)}%`;
};
const EmptyState = ({ message }) => (
    <div className="text-center p-4 text-muted">{message || "Nenhum dado encontrado para os filtros selecionados."}</div>
);
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};
const buildQueryString = (filtro) => {
    const cleanFiltro = Object.fromEntries(
        Object.entries(filtro).filter(([_, v]) => v != null && v !== '')
    );
    return new URLSearchParams(cleanFiltro).toString();
};

export default function TelaRelatorios() {
    // States de filtros (sem alteração)
    const [turmas, setTurmas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [filtroIndividual, setFiltroIndividual] = useState({ aluno_id: "", disciplina_id: "", data_inicial: "", data_final: "" });
    const [filtroTurma, setFiltroTurma] = useState({ turma_id: "", disciplina_id: "", data_inicial: "", data_final: "" });
    const [filtroRanking, setFiltroRanking] = useState({ limit: 10, turma_id: "", disciplina_id: "", data_inicial: "", data_final: "" });
    
    // States de resultados (sem alteração)
    const [resultadoIndividual, setResultadoIndividual] = useState(null);
    const [resultadoTurma, setResultadoTurma] = useState(null);
    const [resultadoRanking, setResultadoRanking] = useState(null);
    const [loadingIndividual, setLoadingIndividual] = useState(false);
    const [loadingTurma, setLoadingTurma] = useState(false);
    const [loadingRanking, setLoadingRanking] = useState(false);

    // useEffect de carregar filtros (sem alteração)
    useEffect(() => {
        const fetchDadosFiltros = async () => {
            try {
                setLoadingFilters(true);
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Token não encontrado.");
                const authHeaders = { Authorization: `Bearer ${token}` };
                const [turmasData, disciplinasData, alunosResp] = await Promise.all([
                    TurmaService.findAll(),
                    DisciplinaService.findAll(),
                    fetch("http://localhost:5001/api/aluno/allaluno", { headers: authHeaders })
                ]);
                if (!alunosResp.ok) throw new Error("Falha ao carregar alunos.");
                const alunosData = await alunosResp.json();
                setTurmas(Array.isArray(turmasData) ? turmasData : []);
                setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
                setAlunos(Array.isArray(alunosData) ? alunosData : []);
            } catch (error) {
                toast.error(error.message || "Erro ao carregar dados para os filtros.");
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchDadosFiltros();
    }, []);

    // --- Handlers de Busca (MODIFICADOS) ---
    const buscarBoletimIndividual = async () => {
        if (!filtroIndividual.aluno_id) { toast.warning("Selecione um aluno."); return; }
        setLoadingIndividual(true);
        try {
            const queryString = buildQueryString(filtroIndividual);
            const resp = await fetch(`http://localhost:5001/api/frequencia/relatorios/individual?${queryString}`, { headers: getAuthHeaders() });
            if (!resp.ok) { const err = await resp.json(); throw new Error(err.message || "Erro."); }
            const dados = await resp.json();
            setResultadoIndividual(dados);
        } catch (error) { toast.error(error.message); } 
        finally { setLoadingIndividual(false); }
    };
    // (buscarBoletimTurma e buscarRankingFaltas permanecem iguais)
    const buscarBoletimTurma = async () => {
        if (!filtroTurma.turma_id) { toast.warning("Selecione uma turma."); return; }
        setLoadingTurma(true);
        try {
            const queryString = buildQueryString(filtroTurma);
            const resp = await fetch(`http://localhost:5001/api/frequencia/relatorios/por-turma?${queryString}`, { headers: getAuthHeaders() });
            if (!resp.ok) { const err = await resp.json(); throw new Error(err.message || "Erro."); }
            const dados = await resp.json();
            setResultadoTurma(dados);
        } catch (error) { toast.error(error.message); } 
        finally { setLoadingTurma(false); }
    };
    const buscarRankingFaltas = async () => {
        setLoadingRanking(true);
        try {
            const queryString = buildQueryString(filtroRanking);
            const resp = await fetch(`http://localhost:5001/api/frequencia/relatorios/ranking-faltas?${queryString}`, { headers: getAuthHeaders() });
            if (!resp.ok) { const err = await resp.json(); throw new Error(err.message || "Erro."); }
            const dados = await resp.json();
            setResultadoRanking(dados);
        } catch (error) { toast.error(error.message); } 
        finally { setLoadingRanking(false); }
    };


    // --- Handler Genérico de PDF (MODIFICADO) ---
    const exportToPDF = (title, head, body) => {
        if (!body || body.length === 0) {
            toast.warn("Não há dados para exportar.");
            return;
        }
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(16);
        doc.text(title, 14, 20); 

        // NOVO: Data de Impressão
        const printDate = "Impresso em: " + new Date().toLocaleString('pt-BR');
        doc.setFontSize(10); 
        doc.text(printDate, 14, 25); // Posição Y logo abaixo do título

        // Tabela (MODIFICADO: startY)
        autoTable(doc, {
            head: [head], 
            body: body,     
            startY: 30, // <-- Ajustado de 25 para 30
            theme: 'striped',
            headStyles: { fillColor: [38, 70, 83] }
        });

        const fileName = `${title.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
    };

    // --- Handlers Específicos de PDF (MODIFICADOS) ---
    const handlePdfIndividual = () => {
        if (!resultadoIndividual) return;
        const alunoNome = alunos.find(a => a.id == filtroIndividual.aluno_id)?.nome || 'Aluno';
        
        // MODIFICADO: Cabeçalho
        const head = ['Disciplina', 'Total Aulas', 'Presenças', 'Faltas', '% Frequência'];
        
        // MODIFICADO: Lógica do corpo
        const body = resultadoIndividual.map(r => {
            const percentualFrequencia = r.percentual_faltas !== null ? 100 - parseFloat(r.percentual_faltas) : null;
            return [
                r.disciplina_nome,
                r.total_aulas,
                r.total_presencas,
                r.total_faltas,
                formatPercent(percentualFrequencia)
            ];
        });
        exportToPDF(`Boletim Individual - ${alunoNome}`, head, body);
    };

    const handlePdfTurma = () => {
        if (!resultadoTurma) return;
        const turmaNome = turmas.find(t => t.id == filtroTurma.turma_id)?.nome || 'Turma';

        // MODIFICADO: Cabeçalho
        const head = ['Aluno', 'Aulas Lançadas', 'Total Faltas', '% Frequência'];
        
        // MODIFICADO: Lógica do corpo
        const body = resultadoTurma.map(r => {
            const percentualFrequencia = r.percentual_faltas !== null ? 100 - parseFloat(r.percentual_faltas) : null;
            return [
                r.aluno_id,
                r.aluno_nome,
                r.total_aulas_lancadas,
                r.total_faltas,
                formatPercent(percentualFrequencia)
            ];
        });
        exportToPDF(`Boletim de Frequência - ${turmaNome}`, head, body);
    };
    
    // (handlePdfRanking não muda, pois não tem porcentagem)
    const handlePdfRanking = () => {
        if (!resultadoRanking) return;
        const head = ['Ranking', 'Aluno', 'Turma', 'Total de Faltas'];
        const body = resultadoRanking.map((r, index) => [
            `#${index + 1}`,
            r.aluno_nome,
            r.turma_nome,
            r.total_faltas
        ]);
        exportToPDF('Ranking de Alunos com Mais Faltas', head, body);
    };


    // --- Handler de Excel (MODIFICADO) ---
    const exportToExcel = (data, fileName) => {
        if (!data || data.length === 0) {
            toast.warn("Não há dados para exportar.");
            return;
        }
        let formattedData = data;
        const firstItem = data[0];

        // MODIFICADO: Case 1 (Individual)
        if (firstItem.hasOwnProperty('disciplina_nome')) {
            formattedData = data.map(item => {
                const percentualFrequencia = item.percentual_faltas !== null ? 100 - parseFloat(item.percentual_faltas) : null;
                return {
                    'Disciplina': item.disciplina_nome, 'Total de Aulas': item.total_aulas,
                    'Presenças': item.total_presencas, 'Faltas': item.total_faltas,
                    '% Frequência': formatPercent(percentualFrequencia), // <-- Mudou aqui
                };
            });
        // MODIFICADO: Case 2 (Turma)
        } else if (firstItem.hasOwnProperty('aluno_nome') && firstItem.hasOwnProperty('total_aulas_lancadas')) {
            formattedData = data.map(item => {
                const percentualFrequencia = item.percentual_faltas !== null ? 100 - parseFloat(item.percentual_faltas) : null;
                return {
                    'ID Aluno': item.aluno_id,
                    'Aluno': item.aluno_nome, 'Aulas Lançadas': item.total_aulas_lancadas,
                    'Total Faltas': item.total_faltas, 
                    '% Frequência': formatPercent(percentualFrequencia), // <-- Mudou aqui
                };
            });
        // (Case 3 - Ranking - sem alteração)
        } else if (firstItem.hasOwnProperty('aluno_nome') && firstItem.hasOwnProperty('total_faltas')) {
            formattedData = data.map((item, index) => ({
                'Ranking': `#${index + 1}`, 'Aluno': item.aluno_nome,
                'Turma': item.turma_nome, 'Total de Faltas': item.total_faltas,
            }));
        }
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };


    if (loadingFilters) {
        return <div className="text-center p-5"><Spinner animation="border" /> Carregando filtros...</div>;
    }

    // --- RENDERIZAÇÃO (JSX) ---
    return (
        <Container className="py-5">
            <h2 className="text-center mb-4">Relatórios e Gráficos</h2>

            <Accordion>
                {/* --- RELATÓRIO 1: BOLETIM INDIVIDUAL (MODIFICADO) --- */}
                <Accordion.Item eventKey="0">
                    <Accordion.Header><i className="bi bi-person-fill me-2"></i>Boletim Individual do Aluno</Accordion.Header>
                    <Accordion.Body>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Row className="g-3 mb-3 align-items-end">
                                    <Col md={3}>
                                        <Form.Label>Aluno</Form.Label>
                                        <Form.Select value={filtroIndividual.aluno_id} onChange={(e) => setFiltroIndividual({ ...filtroIndividual, aluno_id: e.target.value })}>
                                            <option value="">Selecione um aluno...</option>
                                            {alunos.map(a => (<option key={a.id} value={a.id}>{a.nome}</option>))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Disciplina (Opcional)</Form.Label>
                                        <Form.Select value={filtroIndividual.disciplina_id} onChange={(e) => setFiltroIndividual({ ...filtroIndividual, disciplina_id: e.target.value })}>
                                            <option value="">Todas as Disciplinas</option>
                                            {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Data Inicial</Form.Label>
                                        <Form.Control type="date" value={filtroIndividual.data_inicial} onChange={(e) => setFiltroIndividual({ ...filtroIndividual, data_inicial: e.target.value })}/>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Data Final</Form.Label>
                                        <Form.Control type="date" value={filtroIndividual.data_final} onChange={(e) => setFiltroIndividual({ ...filtroIndividual, data_final: e.target.value })}/>
                                    </Col>
                                    <Col md={2}>
                                        <Button onClick={buscarBoletimIndividual} disabled={loadingIndividual} className="w-100">
                                            {loadingIndividual ? <Spinner size="sm" /> : <><i className="bi bi-search me-2"></i> Buscar</>}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                            
                            {/* Resultados (MODIFICADO) */}
                            {resultadoIndividual && (
                                <Card.Footer>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Resultados</h5>
                                        <ButtonGroup size="sm">
                                            {/* Botões de PDF/Excel (sem alteração) */}
                                            <Button variant="outline-danger" onClick={handlePdfIndividual}>
                                                <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                                            </Button>
                                            <Button variant="outline-success" onClick={() => exportToExcel(resultadoIndividual, "Boletim_Individual")}>
                                                <i className="bi bi-file-earmark-excel me-1"></i> Excel
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                    
                                    {resultadoIndividual.length === 0 ? <EmptyState /> : (
                                        <Table striped bordered hover responsive size="sm">
                                            {/* Tabela Individual (MODIFICADA) */}
                                            <thead>
                                                <tr>
                                                    <th>Disciplina</th>
                                                    <th>Total de Aulas</th>
                                                    <th>Presenças</th>
                                                    <th>Faltas</th>
                                                    <th>% Frequência</th> {/* <-- MUDOU */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resultadoIndividual.map(r => {
                                                    // NOVO: Cálculo
                                                    const percentualFrequencia = r.percentual_faltas !== null ? 100 - parseFloat(r.percentual_faltas) : null;
                                                    
                                                    return (
                                                        <React.Fragment key={r.disciplina_id}>
                                                            <tr>
                                                                <td>{r.disciplina_nome}</td>
                                                                <td>{r.total_aulas}</td>
                                                                <td>{r.total_presencas}</td>
                                                                <td>{r.total_faltas}</td>
                                                                {/* MODIFICADO: Classe e Valor */}
                                                                <td className={percentualFrequencia !== null && percentualFrequencia < 75 ? 'text-danger fw-bold' : ''}>
                                                                    {formatPercent(percentualFrequencia)}
                                                                </td>
                                                                
                                                            </tr>
                                                            
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Footer>
                            )}
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>

                {/* --- RELATÓRIO 2: BOLETIM POR TURMA (MODIFICADO) --- */}
                <Accordion.Item eventKey="1">
                    <Accordion.Header><i className="bi bi-people-fill me-2"></i>Boletim de Frequência por Turma</Accordion.Header>
                    <Accordion.Body>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Row className="g-3 mb-3 align-items-end">
                                    <Col md={3}>
                                        <Form.Label>Turma</Form.Label>
                                        <Form.Select value={filtroTurma.turma_id} onChange={(e) => setFiltroTurma({ ...filtroTurma, turma_id: e.target.value })}>
                                            <option value="">Selecione uma turma...</option>
                                            {turmas.map(t => (<option key={t.id} value={t.id}>{t.nome}</option>))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Disciplina (Opcional)</Form.Label>
                                        <Form.Select value={filtroTurma.disciplina_id} onChange={(e) => setFiltroTurma({ ...filtroTurma, disciplina_id: e.target.value })}>
                                            <option value="">Todas as Disciplinas</option>
                                            {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Data Inicial</Form.Label>
                                        <Form.Control type="date" value={filtroTurma.data_inicial} onChange={(e) => setFiltroTurma({ ...filtroTurma, data_inicial: e.target.value })}/>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Data Final</Form.Label>
                                        <Form.Control type="date" value={filtroTurma.data_final} onChange={(e) => setFiltroTurma({ ...filtroTurma, data_final: e.target.value })}/>
                                    </Col>
                                    <Col md={2}>
                                        <Button onClick={buscarBoletimTurma} disabled={loadingTurma} className="w-100">
                                            {loadingTurma ? <Spinner size="sm" /> : <><i className="bi bi-search me-2"></i> Buscar</>}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>

                            {/* Resultados (MODIFICADO) */}
                            {resultadoTurma && (
                                <Card.Footer>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Resultados</h5>
                                        <ButtonGroup size="sm">
                                            {/* Botões (sem alteração) */}
                                            <Button variant="outline-danger" onClick={handlePdfTurma}>
                                                <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                                            </Button>
                                            <Button variant="outline-success" onClick={() => exportToExcel(resultadoTurma, "Boletim_por_Turma")}>
                                                <i className="bi bi-file-earmark-excel me-1"></i> Excel
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                    
                                    {resultadoTurma.length === 0 ? <EmptyState /> : (
                                        <Table striped bordered hover responsive size="sm">
                                            {/* Tabela Turma (MODIFICADA) */}
                                            <thead>
                                                <tr>
                                                    <th>ID Aluno</th> {/* <-- ADICIONADO */}
                                                    <th>Aluno</th>
                                                    <th>Aulas Lançadas</th>
                                                    <th>Total Faltas</th>
                                                    <th>% Frequência</th> {/* <-- MUDOU */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resultadoTurma.map(r => {
                                                    // NOVO: Cálculo
                                                    const percentualFrequencia = r.percentual_faltas !== null ? 100 - parseFloat(r.percentual_faltas) : null;
                                                    
                                                    return (
                                                        <tr key={r.aluno_id}>
                                                            <td>{r.aluno_id}</td> {/* <-- ADICIONADO */}
                                                            <td>{r.aluno_nome}</td>
                                                            <td>{r.total_aulas_lancadas}</td>
                                                            <td>{r.total_faltas}</td>
                                                            {/* MODIFICADO: Classe e Valor */}
                                                            <td className={percentualFrequencia !== null && percentualFrequencia < 75 ? 'text-danger fw-bold' : ''}>
                                                                {formatPercent(percentualFrequencia)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Footer>
                            )}
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>

                {/* --- RELATÓRIO 3: RANKING DE FALTAS (Sem alteração visual) --- */}
                <Accordion.Item eventKey="2">
                    <Accordion.Header><i className="bi bi-graph-up-arrow me-2"></i>Ranking de Alunos com Mais Faltas</Accordion.Header>
                    <Accordion.Body>
                        <Card className="shadow-sm">
                            {/* --- SUBSTITUA ESTE CARD.BODY --- */}
                            <Card.Body>
                                <Row className="g-3 mb-3 align-items-end">
                                    <Col md={1}>
                                        <Form.Label>Top</Form.Label>
                                        <Form.Control type="number" value={filtroRanking.limit} onChange={(e) => setFiltroRanking({ ...filtroRanking, limit: e.target.value })}/>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Turma (Opcional)</Form.Label>
                                        <Form.Select value={filtroRanking.turma_id} onChange={(e) => setFiltroRanking({ ...filtroRanking, turma_id: e.target.value })}>
                                            <option value="">Todas as Turmas</option>
                                            {turmas.map(t => (<option key={t.id} value={t.id}>{t.nome}</option>))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Disciplina (Opcional)</Form.Label>
                                        <Form.Select value={filtroRanking.disciplina_id} onChange={(e) => setFiltroRanking({ ...filtroRanking, disciplina_id: e.target.value })}>
                                            <option value="">Todas as Disciplinas</option>
                                            {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Data Inicial</Form.Label>
                                        <Form.Control type="date" value={filtroRanking.data_inicial} onChange={(e) => setFiltroRanking({ ...filtroRanking, data_inicial: e.target.value })}/>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Data Final</Form.Label>
                                        <Form.Control type="date" value={filtroRanking.data_final} onChange={(e) => setFiltroRanking({ ...filtroRanking, data_final: e.target.value })}/>
                                    </Col>
                                    <Col md={1}>
                                        <Button onClick={buscarRankingFaltas} disabled={loadingRanking} className="w-100">
                                            {loadingRanking ? <Spinner size="sm" /> : <i className="bi bi-search"></i>}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                            
                            {/* Resultados (sem alteração) */}
                            {resultadoRanking && (
                                <Card.Footer>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Resultados</h5>
                                        <ButtonGroup size="sm">
                                            <Button variant="outline-danger" onClick={handlePdfRanking}>
                                                <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                                            </Button>
                                            <Button variant="outline-success" onClick={() => exportToExcel(resultadoRanking, "Ranking_Faltas")}>
                                                <i className="bi bi-file-earmark-excel me-1"></i> Excel
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                    {resultadoRanking.length === 0 ? <EmptyState /> : (
                                        <Table striped bordered hover responsive size="sm">
                                            <thead><tr><th>Ranking</th><th>Aluno</th><th>Turma</th><th>Total de Faltas</th></tr></thead>
                                            <tbody>
                                                {resultadoRanking.map((r, index) => (
                                                    <tr key={r.aluno_id}><td>#{index + 1}</td><td>{r.aluno_nome}</td><td>{r.turma_nome}</td><td className="fw-bold text-danger">{r.total_faltas}</td></tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Footer>
                            )}
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
}