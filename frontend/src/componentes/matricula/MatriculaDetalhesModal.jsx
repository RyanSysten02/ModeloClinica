import React from "react";
import { Modal, Button, Form, Container, Row, Col, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

function MatriculaDetalhesModal({ show, onHide, matricula }) {
  if (!matricula) return null;

  const atualizarStatus = async (id, novoStatus) => {
    const confirmado = window.confirm(`Deseja realmente ${novoStatus === "cancelada" ? "cancelar" : "inativar"} esta matrícula?`);
    if (!confirmado) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/matricula/matricula/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        toast.success(`Matrícula ${novoStatus === "cancelada" ? "cancelada" : "inativada"} com sucesso.`);
        onHide(); // Fecha o modal após a atualização
      } else {
        toast.warning("Erro ao atualizar status da matrícula.");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ativa":
        return <Badge bg="success">Ativa</Badge>;
      case "inativa":
        return <Badge bg="secondary">Inativa</Badge>;
      case "cancelada":
        return <Badge bg="danger">Cancelada</Badge>;
      default:
        return <Badge bg="dark">Desconhecido</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>📋 Detalhes da Matrícula</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Status:</strong> {getStatusBadge(matricula.status)}
              </Col>
              <Col md={6}>
                <strong>Data da Matrícula:</strong>{" "}
                {matricula.data_matricula ? dayjs(matricula.data_matricula).format("DD/MM/YYYY") : "—"}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Aluno</Form.Label>
                  <Form.Control
                    type="text"
                    value={matricula.aluno?.nome || ""}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Turma</Form.Label>
                  <Form.Control
                    type="text"
                    value={matricula.turma?.nome || ""}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Responsável</Form.Label>
                  <Form.Control
                    type="text"
                    value={matricula.responsavel?.nome || "Não informado"}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={matricula.observacoes || "—"}
                    readOnly
                    rows={2}
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
        {matricula.status !== "inativa" && (
          <Button variant="warning" onClick={() => atualizarStatus(matricula.id, "inativa")}>
            Inativar
          </Button>
        )}
        {matricula.status !== "cancelada" && (
          <Button variant="danger" onClick={() => atualizarStatus(matricula.id, "cancelada")}>
            Cancelar Matrícula
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default MatriculaDetalhesModal;
