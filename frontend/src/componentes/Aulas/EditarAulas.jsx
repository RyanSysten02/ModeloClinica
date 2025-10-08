import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Alert, Modal } from "react-bootstrap";
import ListaProfessoresModal from "../professor/ListaProfessores";
import DisciplinaService from "../../services/Disciplina";

/**
 * EditarAulas.jsx (modificado)
 * ✅ Faz apenas a seleção de Disciplina e Professor
 * ✅ A cor do professor é atribuída aleatoriamente na 1ª seleção e persistida (localStorage)
 * ✅ Ao confirmar, retorna: { subjectId, subject, teacherId, teacherName, teacherColor }
 * ✅ Suporta valores iniciais via `defaults`
 *
 * Props:
 *  - show: boolean
 *  - onHide: () => void
 *  - onConfirm: (payload) => void
 *  - defaults?: {
 *      subjectId?: string|number,     // disciplina_id
 *      subject?: string,              // disciplina nome
 *      disciplina_id?: string|number, // alias comum vindo do backend
 *      teacherId?: string|number,
 *      teacherName?: string
 *    }
 */

const COLOR_PALETTE = [
  "#FDE047", // amarelo
  "#86EFAC", // verde-claro
  "#93C5FD", // azul-claro
  "#FCA5A5", // vermelho-claro
  "#D8B4FE", // roxo-claro
  "#FDBA74", // laranja-claro
  "#99F6E4", // ciano-claro
  "#F9A8D4", // rosa-claro
  "#A7F3D0", // verde-menta
  "#BFDBFE", // azul-bebê
];

function getStoredColorMap() {
  try {
    const raw = localStorage.getItem("profColorMap");
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function setStoredColor(profId, color) {
  const map = getStoredColorMap();
  map[profId] = color;
  localStorage.setItem("profColorMap", JSON.stringify(map));
}

function getColorForProfessor(profId) {
  const map = getStoredColorMap();
  return map?.[profId] || null;
}

function pickRandomColor(excludeColors = []) {
  const candidates = COLOR_PALETTE.filter((c) => !excludeColors.includes(c));
  if (candidates.length === 0)
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function EditarAulas({ show, onHide, onConfirm, defaults }) {
  const [listaDisciplinas, setListaDisciplinas] = useState([]); // [{id, nome}]
  const [mensagemErro, setMensagemErro] = useState("");

  // Disciplina
  const initialSubjectId =
    defaults?.subjectId ?? defaults?.disciplina_id ?? "";
  const initialSubjectName = defaults?.subject ?? "";

  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [subject, setSubject] = useState(initialSubjectName);

  // Professor
  const [teacherId, setTeacherId] = useState(defaults?.teacherId || "");
  const [teacherName, setTeacherName] = useState(defaults?.teacherName || "");

  // Modal de seleção de professores
  const [showListaProfessoresModal, setShowListaProfessoresModal] = useState(false);

  // Carrega disciplinas quando abrir
  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const disciplinas = await DisciplinaService.findAll();
        const list = Array.isArray(disciplinas) ? disciplinas : [];
        setListaDisciplinas(list);

        // Se veio apenas o nome (subject) sem id, tenta mapear o id correspondente
        if (!initialSubjectId && initialSubjectName) {
          const found = list.find((d) => String(d.nome) === String(initialSubjectName));
          if (found) {
            setSubjectId(found.id);
            setSubject(found.nome);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        setListaDisciplinas([]);
      }
    };
    if (show) fetchDisciplinas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Recarrega defaults ao abrir
  useEffect(() => {
    if (show) {
      setMensagemErro("");

      setSubjectId(defaults?.subjectId ?? defaults?.disciplina_id ?? "");
      setSubject(defaults?.subject ?? "");

      setTeacherId(defaults?.teacherId || "");
      setTeacherName(defaults?.teacherName || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, defaults]);

  // Cor do professor: busca no localStorage; se não houver, sorteia e persiste
  const teacherColor = useMemo(() => {
    if (!teacherId) return "";
    const existing = getColorForProfessor(teacherId);
    if (existing) return existing;
    // Evitar repetir muito a mesma cor
    const used = Object.values(getStoredColorMap());
    const color = pickRandomColor(used);
    setStoredColor(teacherId, color);
    return color;
  }, [teacherId]);

  const handleSelectProfessor = (professor) => {
    setTeacherId(professor.id);
    setTeacherName(professor.nome);
    setShowListaProfessoresModal(false);
  };

  const handleChangeDisciplina = (e) => {
    const id = e.target.value;
    setSubjectId(id);
    const sel = listaDisciplinas.find((d) => String(d.id) === String(id));
    setSubject(sel?.nome || "");
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setMensagemErro("");

    if (!subjectId) {
      setMensagemErro("Selecione a disciplina.");
      return;
    }
    if (!teacherId || !teacherName) {
      setMensagemErro("Selecione o professor.");
      return;
    }

    onConfirm?.({
      subjectId,        // disciplina_id
      subject,          // disciplina nome (para exibir na célula)
      teacherId,
      teacherName,
      teacherColor: teacherColor || pickRandomColor(),
    });

    onHide?.();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Selecionar Disciplina e Professor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDisciplina" className="mb-3">
            <Form.Label>Disciplina</Form.Label>
            <Form.Select name="subjectId" value={subjectId} onChange={handleChangeDisciplina}>
              <option value="">Selecione uma Disciplina</option>
              {listaDisciplinas.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formProfessor" className="mb-2">
            <Form.Label>Professor</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Selecione o professor"
                value={teacherName}
                readOnly
                style={{ flex: 1, backgroundColor: "#e9ecef" }}
              />
              <Button
                variant="secondary"
                onClick={() => setShowListaProfessoresModal(true)}
                className="ms-2"
              >
                <i className="bi bi-search" />
              </Button>
            </div>
          </Form.Group>

          {/* Preview da cor do professor */}
          {teacherId && (
            <div className="mb-3" style={{ fontSize: 12, color: "#6c757d" }}>
              Cor do professor:
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  marginLeft: 8,
                  border: "1px solid rgba(0,0,0,.1)",
                  background: teacherColor || "#ddd",
                  verticalAlign: "middle",
                }}
              />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="outline-secondary" onClick={onHide} type="button">
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              Confirmar
            </Button>
          </div>
        </Form>

        <ListaProfessoresModal
          show={showListaProfessoresModal}
          onHide={() => setShowListaProfessoresModal(false)}
          onSelectProfessor={handleSelectProfessor}
        />
      </Modal.Body>
    </Modal>
  );
}
