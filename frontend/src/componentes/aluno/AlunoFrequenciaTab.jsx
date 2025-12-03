import React, { useState, useEffect } from 'react';
import { Button, Spinner, Table, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

// --- Imports para Gráfico ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// --- Imports para PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Registra os componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Funções Auxiliares ---
const formatPercent = (value) => {
    // Se o valor for nulo (ex: 0 aulas), retorna N/A
    if (value === null || value === undefined) return "N/A";
    return `${parseFloat(value).toFixed(2)}%`;
};

const EmptyState = ({ message }) => (
    <Alert variant="info" className="text-center">
        {message || "Nenhum dado encontrado para os filtros selecionados."}
    </Alert>
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
// --- Fim das Funções Auxiliares ---


// --- Componente de Gráfico (Sem alteração) ---
const GraficoFrequenciaDisciplina = ({ presencas, faltas }) => {
    const data = {
        labels: ['Presenças', 'Faltas'],
        datasets: [
            {
                label: 'Status da Aula',
                data: [presencas, faltas],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)', // Verde (Presença)
                    'rgba(255, 99, 132, 0.2)', // Vermelho (Falta)
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
    };

    return (
        <div style={{ maxWidth: '250px', margin: '0 auto' }}>
            <Pie data={data} options={options} />
        </div>
    );
};


// --- Componente Principal Atualizado ---
export default function AlunoFrequenciaTab({ aluno }) {
    
    const [currentYear] = useState(new Date().getFullYear());
    
    const [filtro, setFiltro] = useState({ 
        aluno_id: aluno?.id || null, 
        disciplina_id: "", 
        data_inicial: `${currentYear}-01-01`, 
        data_final: `${currentYear}-12-31` 
    });
    
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [disciplinaGraficoId, setDisciplinaGraficoId] = useState(null);


    // --- Efeitos (useEffect) ---

    // Atualizar o filtro se a prop 'aluno' mudar
    useEffect(() => {
        if (aluno?.id) {
            setFiltro(prev => ({ 
                ...prev, 
                aluno_id: aluno.id 
            }));
            setResultado(null); 
            setDisciplinaGraficoId(null); 
        }
    }, [aluno]);

    // Função de busca
    const buscarFrequenciaIndividual = async () => {
        if (!filtro.aluno_id) {
            toast.warning("ID do aluno não encontrado.");
            return;
        }
        setLoading(true);
        setResultado(null); 
        setDisciplinaGraficoId(null); 
        try {
            const queryString = buildQueryString(filtro);
            const resp = await fetch(`http://localhost:5001/api/frequencia/relatorios/individual?${queryString}`, { 
                headers: getAuthHeaders() 
            });
            
            if (!resp.ok) { 
                const err = await resp.json(); 
                throw new Error(err.message || "Erro ao buscar frequência."); 
            }
            
            const dados = await resp.json();
            setResultado(dados);
        } catch (error) { 
            toast.error(error.message); 
            setResultado([]);
        } finally { 
            setLoading(false); 
        }
    };
    
    // Dispara a busca inicial
    useEffect(() => {
        if (aluno?.id) {
            buscarFrequenciaIndividual();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aluno?.id]); 


    // --- Funções de PDF ATUALIZADAS ---

    /**
     * MODIFICADO: Adicionado data de impressão e ajustado o startY da tabela.
     */
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
        doc.setFontSize(10); // Fonte menor para a data
        doc.text(printDate, 14, 25); // Posição Y logo abaixo do título

        // Tabela (MODIFICADO: startY)
        autoTable(doc, {
            head: [head], 
            body: body,     
            startY: 30, // <-- Ajustado de 25 para 30 para dar espaço
            theme: 'striped',
            headStyles: { fillColor: [38, 70, 83] }
        });

        const fileName = `${title.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
    };

    /**
     * MODIFICADO: Atualizado 'head' e lógica do 'body' para refletir % Frequência.
     */
    const handlePdfIndividual = () => {
        if (!resultado || resultado.length === 0) {
            toast.warn("Não há resultados para imprimir.");
            return;
        }
        
        // MODIFICADO: Cabeçalho
        const head = ['Disciplina', 'Total Aulas', 'Presenças', 'Faltas', '% Frequência'];
        
        // MODIFICADO: Lógica do corpo
        const body = resultado.map(r => {
            // Calcula a frequência (100 - % faltas)
            const percentualFrequencia = r.percentual_faltas !== null ? 100 - parseFloat(r.percentual_faltas) : null;
            return [
                r.disciplina_nome,
                r.total_aulas,
                r.total_presencas,
                r.total_faltas,
                formatPercent(percentualFrequencia) // Usa o valor da frequência
            ];
        });
        exportToPDF(`Frequência - ${aluno ? aluno.nome : 'Aluno'} (${currentYear})`, head, body);
    };


    // --- RENDERIZAÇÃO ---
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
                <h5 className="mb-0 text-muted">
                    Resultados para o ano de {currentYear}
                </h5>
                <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handlePdfIndividual}
                    disabled={!resultado || resultado.length === 0}
                >
                    <i className="bi bi-file-earmark-pdf me-1"></i> Imprimir
                </Button>
            </div>

            {/* --- Resultados --- */}
            {loading && (
                <div className="text-center p-3">
                    <Spinner animation="border" /> Buscando dados...
                </div>
            )}

            {!loading && resultado && (
                resultado.length === 0 ? (
                    <EmptyState />
                ) : (
                    <Table striped bordered hover responsive size="sm">
                        {/* --- Tabela Atualizada --- */}
                        <thead>
                            <tr>
                                <th>Disciplina</th>
                                <th>Total de Aulas</th>
                                <th>Presenças</th>
                                <th>Faltas</th>
                                {/* MODIFICADO: Label */}
                                <th>% Frequência</th>
                                <th className="text-center">Gráfico</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* MODIFICADO: Lógica de cálculo movida para dentro do map */}
                            {resultado.map(r => {
                                // NOVO: Calcular a frequência
                                const percentualFrequencia = r.percentual_faltas !== null ? 100 - parseFloat(r.percentual_faltas) : null;

                                return (
                                    <React.Fragment key={r.disciplina_id}>
                                        <tr>
                                            <td>{r.disciplina_nome}</td>
                                            <td>{r.total_aulas}</td>
                                            <td>{r.total_presencas}</td>
                                            <td>{r.total_faltas}</td>
                                            
                                            {/* MODIFICADO: Lógica de classe e valor */}
                                            <td className={percentualFrequencia !== null && percentualFrequencia < 75 ? 'text-danger fw-bold' : ''}>
                                                {formatPercent(percentualFrequencia)}
                                            </td>
                                            
                                            <td className="text-center align-middle">
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    onClick={() => setDisciplinaGraficoId(
                                                        disciplinaGraficoId === r.disciplina_id ? null : r.disciplina_id
                                                    )}
                                                    title="Ver gráfico"
                                                    className="p-0"
                                                >
                                                    <i className={`bi ${disciplinaGraficoId === r.disciplina_id ? 'bi-x-circle-fill text-danger' : 'bi-pie-chart-fill'}`}></i>
                                                </Button>
                                            </td>
                                        </tr>
                                        
                                        {/* Linha condicional para exibir o gráfico */}
                                        {disciplinaGraficoId === r.disciplina_id && (
                                            <tr>
                                                <td colSpan="6" className="p-3">
                                                    <h6 className="text-center mb-3">
                                                        Resumo de Frequência: {r.disciplina_nome}
                                                    </h6>
                                                    <GraficoFrequenciaDisciplina 
                                                        presencas={r.total_presencas} 
                                                        faltas={r.total_faltas} 
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </Table>
                )
            )}
        </>
    );
}