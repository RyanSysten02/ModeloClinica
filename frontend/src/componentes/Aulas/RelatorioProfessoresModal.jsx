import React, { useMemo, useState, useRef } from "react";
import { Modal, Table, Form, Button } from "react-bootstrap";

export default function RelatorioProfessoresModal({
  show,
  onHide,
  columns,
  relatorio,
}) {
  const printRef = useRef();

  const [filtroProfessores, setFiltroProfessores] = useState([]);
  const [filtroTurmas, setFiltroTurmas] = useState([]);

  // ============================
  // MAPEAMENTO DO RELATÓRIO
  // ============================
  const relatorioMapeado = useMemo(() => {
    return relatorio.map((prof) => {
      return { ...prof };
    });
  }, [relatorio]);

  // ============================
  // FILTROS
  // ============================
  const filtrados = useMemo(() => {
    return relatorioMapeado.filter((prof) => {
      // Professores
      if (filtroProfessores.length) {
        if (!filtroProfessores.includes(String(prof.professorId))) return false;
      }

      // Turmas
      if (filtroTurmas.length) {
        const temTurma = Object.keys(prof.porTurma).some((t) =>
          filtroTurmas.includes(t)
        );
        if (!temTurma) return false;
      }

      return true;
    });
  }, [relatorioMapeado, filtroProfessores, filtroTurmas]);

  const colunasVisiveis = filtroTurmas.length ? filtroTurmas : columns;

  // ============================
  // SELECT ALL
  // ============================
  const handleSelectAllProf = () => {
    if (filtroProfessores.length === relatorio.length) {
      setFiltroProfessores([]);
    } else {
      setFiltroProfessores(relatorio.map((p) => String(p.professorId)));
    }
  };

  const handleSelectAllTurmas = () => {
    if (filtroTurmas.length === columns.length) {
      setFiltroTurmas([]);
    } else {
      setFiltroTurmas(columns);
    }
  };

  // ============================
  // IMPRESSÃO 100% CORRIGIDA
  // ============================
  const handlePrint = () => {
    if (!printRef.current) return;

    const conteudo = printRef.current.innerHTML;

    const janela = window.open("", "_blank", "width=900,height=650");

    janela.document.write(`
      <html>
        <head>
          <title>Relatório de Professores</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 6px 8px;
              text-align: center;
            }
            th {
              background: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Relatório de Professores</h2>
          ${conteudo}
        </body>
      </html>
    `);

    janela.document.close();
    janela.focus();

    setTimeout(() => {
      janela.print();
      janela.close();
    }, 300);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>📊 Relatório de Professores</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ================== FILTROS ================== */}
        <div className="mb-3 d-flex flex-wrap gap-4">

          {/* PROFESSORES */}
          <Form.Group style={{ minWidth: 250 }}>
            <Form.Label>Professores</Form.Label>

            <Form.Select
              multiple
              value={filtroProfessores}
              onChange={(e) =>
                setFiltroProfessores(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
            >
              {relatorio.map((p) => (
                <option key={p.professorId} value={p.professorId}>
                  {p.professorName}
                </option>
              ))}
            </Form.Select>

            <Button
              variant="outline-secondary"
              className="mt-1 w-100"
              onClick={handleSelectAllProf}
            >
              {filtroProfessores.length === relatorio.length
                ? "🌐 Limpar seleção"
                : "✔️ Selecionar todos"}
            </Button>
          </Form.Group>

          {/* TURMAS */}
          <Form.Group style={{ minWidth: 200 }}>
            <Form.Label>Turmas</Form.Label>

            <Form.Select
              multiple
              value={filtroTurmas}
              onChange={(e) =>
                setFiltroTurmas(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </Form.Select>

            <Button
              variant="outline-secondary"
              className="mt-1 w-100"
              onClick={handleSelectAllTurmas}
            >
              {filtroTurmas.length === columns.length
                ? "🌐 Limpar seleção"
                : "✔️ Selecionar todas"}
            </Button>
          </Form.Group>
        </div>

        {/* ================== TABELA ================== */}
        <div ref={printRef} style={{ maxHeight: 600, overflowY: "auto" }}>
          <Table bordered striped hover>
            <thead>
              <tr>
                <th>Professor</th>
                {colunasVisiveis.map((t) => (
                  <th key={t}>{t}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((row) => (
                <tr key={row.professorId}>
                  <td>{row.professorName}</td>

                  {colunasVisiveis.map((t) => (
                    <td key={t} className="text-center">
                      {row.porTurma[t] || 0}
                    </td>
                  ))}

                  <td className="fw-bold text-center">{row.total}</td>
                </tr>
              ))}

              {!filtrados.length && (
                <tr>
                  <td colSpan={colunasVisiveis.length + 2} className="text-center">
                    Nenhum resultado.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>

        <Button variant="primary" onClick={handlePrint}>
          🖨️ Exportar PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
