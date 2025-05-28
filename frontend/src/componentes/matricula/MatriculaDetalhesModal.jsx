import React from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";

function MatriculaDetalhesModal({ show, onHide, matricula }) {
  if (!matricula) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Matrícula</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Aluno</Form.Label>
                  <Form.Control
                    type="text"
                    value={matricula.aluno?.nome || ""}
                    readOnly
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
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Responsável</Form.Label>
                  <Form.Control
                    type="text"
                    value={matricula.responsavel?.nome || "Não informado"}
                    readOnly
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
      </Modal.Footer>
    </Modal>
  );
}

export default MatriculaDetalhesModal;
