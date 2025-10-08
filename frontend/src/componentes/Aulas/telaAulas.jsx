import React, { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import EditarAulas from "./EditarAulas";

const DAYS = ["Segunda","Terça","Quarta","Quinta","Sexta"];
const COLUMNS = ["6º ano","7º ano","8º ano","9º ano","1ª série","2ª série","3ª série"];

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export default function AtribuicaoDeAulas() {
  const [horarios, setHorarios] = useState([]); // [{id, rotulo, is_intervalo, sequencia, ...}]
  const [schedule, setSchedule] = useState(DAYS.reduce((acc, d) => ({...acc, [d]: []}), {}));
  const [currentDay, setCurrentDay] = useState(DAYS[0]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState([]);           // matriz [linhas][colunas]
  const [clipboard, setClipboard] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState(null); // {row, col}

  const token = localStorage.getItem("token");

  // Helpers de matriz baseado nos horários carregados
  const emptyDay = useMemo(() => {
    return () => horarios.map(() => COLUMNS.map(() => null));
  }, [horarios]);

  // Carregar horários
  useEffect(() => {
    const loadHorarios = async () => {
      const resp = await fetch("http://localhost:5001/api/aulas/horarios", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      setHorarios(data || []);
    };
    if (token) loadHorarios();
  }, [token]);

  // Carregar aulas do dia sempre que mudar dia ou horários estiverem prontos
  useEffect(() => {
    const loadAulasDia = async () => {
      if (!horarios.length) return;
      const resp = await fetch(`http://localhost:5001/api/aulas?dia=${encodeURIComponent(currentDay)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json(); // [{horario_id, turma, disciplina_id, disciplina_nome, professor_id, professor_nome, cor}]
      // Monta matriz vazia
      const matrix = emptyDay();
      // Map horário_id -> row idx
      const rowIndexByHorario = {};
      horarios.forEach((h, idx) => { rowIndexByHorario[h.id] = idx; });

      // Preenche
      data.forEach(a => {
        const r = rowIndexByHorario[a.horario_id];
        const c = COLUMNS.findIndex(col => col === a.turma);
        if (r >= 0 && c >= 0) {
          matrix[r][c] = {
            subjectId: a.disciplina_id,
            subject: a.disciplina_nome,
            teacherId: a.professor_id,
            teacherName: a.professor_nome,
            teacherColor: a.cor || "#eee",
          };
        }
      });

      setSchedule(prev => ({ ...prev, [currentDay]: matrix }));
      setDraft(matrix);
    };
    if (token && currentDay) loadAulasDia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentDay, horarios]);

  const handleEditToggle = () => {
    if (!editMode) {
      setDraft(deepClone(schedule[currentDay] || emptyDay()));
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    // Transforma draft em array de aulas para enviar
    const aulas = [];
    draft.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        const h = horarios[rowIdx];
        const turma = COLUMNS[colIdx];
        const isBreak = Number(h?.is_intervalo) === 1;
        if (isBreak || !cell) return;
        aulas.push({
          horario_id: h.id,
          turma,
          disciplina_id: cell.subjectId,
          professor_id: cell.teacherId,
          cor: cell.teacherColor || null,
        });
      });
    });

    const resp = await fetch("http://localhost:5001/api/aulas/salvar-dia", {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dia: currentDay, aulas }),
    });

    if (resp.ok) {
      setSchedule(prev => ({ ...prev, [currentDay]: deepClone(draft) }));
      setEditMode(false);
    } else {
      const err = await resp.json().catch(() => ({}));
      alert(err.message || "Erro ao salvar o dia.");
    }
  };

  const handleCancel = () => {
    setDraft(deepClone(schedule[currentDay] || emptyDay()));
    setEditMode(false);
  };

  const handleCopy = () => setClipboard(deepClone(schedule[currentDay] || emptyDay()));
  const handlePaste = () => { if (editMode && clipboard) setDraft(deepClone(clipboard)); };
  const handleClear = () => {
    if (!editMode) return;
    if (window.confirm(`Limpar todas as aulas de ${currentDay}?`)) {
      setDraft(emptyDay());
    }
  };

  const openCellModal = (row, col) => { if (editMode) { setModalCell({row,col}); setModalOpen(true); } };
  const confirmCell = (entry) => {
    setDraft(prev => {
      const next = deepClone(prev);
      next[modalCell.row][modalCell.col] = entry; // {subjectId, subject, teacherId, teacherName, teacherColor}
      return next;
    });
    setModalOpen(false); setModalCell(null);
  };

  const currentMatrix = editMode ? draft : (schedule[currentDay] || emptyDay());

  return (
    <Container fluid className="py-3">
      <h2 className="text-center mb-4">Aulas</h2>

      {/* Dias + Ações */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <ButtonGroup className="flex-wrap">
          {DAYS.map(d => (
            <Button
              key={d}
              size="sm"
              variant={currentDay===d ? "primary" : "outline-secondary"}
              onClick={() => setCurrentDay(d)}
              style={{ borderRadius: 999, marginRight: 6, marginBottom: 6 }}
            >
              {d}
            </Button>
          ))}
        </ButtonGroup>

        <div className="d-flex align-items-center gap-2">
          {!editMode ? (
            <Button size="sm" variant="outline-secondary" onClick={handleEditToggle} style={{ borderRadius: 999 }}>
              ✏️ Editar
            </Button>
          ) : (
            <>
              <Button size="sm" variant="primary" onClick={handleSave} style={{ borderRadius: 999 }}>
                💾 Salvar
              </Button>
              <Button size="sm" variant="outline-secondary" onClick={handleCancel} style={{ borderRadius: 999 }}>
                ❌ Cancelar
              </Button>
            </>
          )}

          <div style={{ width:1, height:24, background:"#dee2e6" }} />

          <Button size="sm" variant="outline-secondary" onClick={handleCopy} style={{ borderRadius: 999 }}>
            📋 Copiar
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={handlePaste} disabled={!editMode || !clipboard} style={{ borderRadius: 999 }}>
            📥 Colar
          </Button>
          <Button size="sm" variant="danger" onClick={handleClear} disabled={!editMode} style={{ borderRadius: 999 }}>
            🧹 Limpar
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-responsive" style={{ border: "1px solid #dee2e6", borderRadius: 16, overflow: "hidden" }}>
        <table className="table mb-0" style={{ minWidth: 960 }}>
          <thead className="table-light">
            <tr>
              <th style={{ position:"sticky", left:0, zIndex:1, background:"#f8f9fa", width:160 }}>HORA</th>
              {COLUMNS.map(col => (<th key={col}>{col}</th>))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((h, rowIdx) => (
              <tr key={h.id}>
                <td style={{ position:"sticky", left:0, zIndex:1, background:"#fff", width:160 }}>{h.rotulo}</td>
                {COLUMNS.map((_, colIdx) => {
                  const entry = currentMatrix[rowIdx]?.[colIdx] || null;
                  const isBreak = Number(h.is_intervalo) === 1;
                  if (isBreak) return <td key={`${rowIdx}-${colIdx}`} className="text-center text-muted">—</td>;
                  return (
                    <td key={`${rowIdx}-${colIdx}`}>
                      <button
                        onClick={() => openCellModal(rowIdx, colIdx)}
                        disabled={!editMode}
                        className={`w-100 btn btn-sm ${editMode ? "btn-outline-secondary" : "btn-outline-secondary disabled"}`}
                        style={{ textAlign:"left", borderRadius: 12 }}
                      >
                        {entry ? (
                          <div style={{
                            background: entry.teacherColor,
                            borderRadius: 12,
                            padding: "6px 10px",
                            lineHeight: 1.1,
                            boxShadow: "0 1px 2px rgba(0,0,0,.06)",
                            opacity: editMode ? 0.5 : 1,
                            transition: "opacity .2s ease-in-out"
                          }}>
                            <div style={{ fontWeight:600, marginBottom:2, fontSize:13 }}>{entry.subject}</div>
                            <div style={{ fontSize:12, opacity:.85 }}>{entry.teacherName}</div>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 12 }}>
                            {editMode ? "Clique para definir" : "—"}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal real (agora devolve subjectId também) */}
      <EditarAulas
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        defaults={
          modalCell && currentMatrix?.[modalCell.row]?.[modalCell.col]
            ? currentMatrix[modalCell.row][modalCell.col]
            : undefined
        }
        onConfirm={confirmCell}
      />

      <p className="mt-3 text-muted text-center" style={{ fontSize: 12 }}>
        Ative <strong>Editar</strong> para definir aulas; use <strong>Copiar/Colar</strong> para replicar um dia.
      </p>
    </Container>
  );
}
