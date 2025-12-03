import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Spinner, Form } from 'react-bootstrap';

export default function HistoricoAulasModal({
  show,
  onHide,
  dia,         // 'Segunda', 'Terça', ...
  horarios = [],
  columns = [],
  onApplySnapshot, // (matrix, meta) => void
}) {
  const [listaHistorico, setListaHistorico] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingApplyId, setLoadingApplyId] = useState(null);

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const token = localStorage.getItem('token');

  // Quando abre o modal, define intervalo padrão (últimos 30 dias) e busca
  useEffect(() => {
    if (!show) return;

    const hoje = new Date();
    const fim = hoje.toISOString().slice(0, 10);

    const inicioDate = new Date();
    inicioDate.setDate(inicioDate.getDate() - 30);
    const ini = inicioDate.toISOString().slice(0, 10);

    setDataInicio(ini);
    setDataFim(fim);

    fetchHistorico(ini, fim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchHistorico = async (inicio, fim) => {
    if (!token) return;
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.append('dataInicio', inicio);
      if (fim) params.append('dataFim', fim);

      const resp = await fetch(
        `http://localhost:5001/api/aulas/historico?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await resp.json();
      setListaHistorico(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setListaHistorico([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleFiltrar = () => {
    fetchHistorico(dataInicio, dataFim);
  };

  const buildMatrixFromSnapshot = (snapshotFullSemana, diaSemana) => {
    // Filtra apenas o dia atual
    const snapshotDia = (snapshotFullSemana || []).filter(
      (a) => a.dia_semana === diaSemana
    );

    // Cria matriz vazia [horarios][turmas]
    const matrix = horarios.map(() => columns.map(() => null));

    const rowIndexByHorario = {};
    horarios.forEach((h, idx) => {
      rowIndexByHorario[h.id] = idx;
    });

    snapshotDia.forEach((a) => {
      const r = rowIndexByHorario[a.horario_id];
      const c = columns.findIndex((col) => col === a.turma);
      if (r >= 0 && c >= 0) {
        matrix[r][c] = {
          subjectId: a.disciplina_id,
          subject: a.disciplina_nome,
          teacherId: a.professor_id,
          teacherName: a.professor_nome,
          teacherColor: a.cor || '#eee',
        };
      }
    });

    return matrix;
  };

  const handleAplicar = async (id) => {
    setLoadingApplyId(id);
    try {
      const resp = await fetch(
        `http://localhost:5001/api/aulas/historico/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await resp.json();
      const snapshot = Array.isArray(data.snapshot) ? data.snapshot : [];

      // snapshot contém TODA a semana,
      // montamos a matriz só pro dia atual
      const matrix = buildMatrixFromSnapshot(snapshot, dia);

      onApplySnapshot?.(matrix, data);
    } catch (error) {
      console.error('Erro ao aplicar histórico:', error);
    } finally {
      setLoadingApplyId(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Histórico de Edições </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Filtro por data */}
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: 13 }}>Data início</Form.Label>
            <Form.Control
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={{ minWidth: 150 }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ fontSize: 13 }}>Data fim</Form.Label>
            <Form.Control
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={{ minWidth: 150 }}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="ms-auto"
            onClick={handleFiltrar}
          >
            🔎 Filtrar
          </Button>
        </div>

        {loadingList ? (
          <div className="d-flex align-items-center justify-content-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Carregando histórico...
          </div>
        ) : listaHistorico.length === 0 ? (
          <div className="text-center text-muted py-4">
            Nenhuma edição registrada no período selecionado.
          </div>
        ) : (
          <div className="table-responsive">
            <Table size="sm" hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Data / Hora</th>              
                  <th>Usuário (ID)</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaHistorico.map((h, idx) => (
                  <tr key={h.id}>
                    <td>{idx + 1}</td>
                    <td>
                      {h.dh_versao
                        ? new Date(h.dh_versao).toLocaleString('pt-BR')
                        : '-'}
                    </td>
                    <td>{h.id_usuario ?? '-'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={loadingApplyId === h.id}
                        onClick={() => handleAplicar(h.id)}
                      >
                        {loadingApplyId === h.id ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Carregando...
                          </>
                        ) : (
                          'Carregar grade dessa edição'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
