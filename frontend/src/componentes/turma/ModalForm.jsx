import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

export const ModalForm = ({ show, onHide, onSave, selected }) => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const isValid = form.checkValidity();

    if (!isValid) event.stopPropagation();

    setValidated(true);

    if (isValid) {
      const formData = new FormData(event.target);
      const payload = {
        nome: formData.get("nome"),
        ano_letivo: formData.get("ano_letivo"),
        periodo: formData.get("periodo"),
        semestre: formData.get("semestre"),
        status: formData.get("status"),
      };

      onSave(payload);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Turma</Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col} md={12} controlId="validationCustomNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                required
                type="text"
                name="nome"
                placeholder="Digite o nome da turma"
                defaultValue={selected?.nome}
              />
              <Form.Control.Feedback type="invalid">
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md={3} controlId="validationCustomAnoLetivo">
              <Form.Label>Ano Letivo</Form.Label>
              <Form.Control
                required
                type="number"
                name="ano_letivo"
                placeholder="Digite o ano letivo"
                defaultValue={selected?.ano_letivo}
              />
              <Form.Control.Feedback type="invalid">
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={3} controlId="validationCustomPeriodo">
              <Form.Label>Período</Form.Label>
              <Form.Control
                required
                type="text"
                name="periodo"
                placeholder="Digite o ano período"
                defaultValue={selected?.periodo}
              />
              <Form.Control.Feedback type="invalid">
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={3} controlId="validationCustomSemestre">
              <Form.Label>Semestre</Form.Label>
              <Form.Control
                required
                type="number"
                name="semestre"
                placeholder="Digite o semestre"
                defaultValue={selected?.semestre}
              />
              <Form.Control.Feedback type="invalid">
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={3} controlId="validationCustomStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                aria-label="Escolha o status"
                required
                name="status"
                defaultValue={selected?.status}
              >
                <option>Escolha o status</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Encerrada">Encerrada</option>
                <option value="Concluída">Concluída</option>
                <option value="Não iniciada">Não iniciada</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Fechar
          </Button>
          <Button variant="outline-dark" type="reset">
            Limpar
          </Button>
          <Button type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
