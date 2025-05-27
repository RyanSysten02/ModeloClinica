import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

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
        nome: formData.get('nome'),
      };

      onSave(payload);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size='xl'>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Disciplina</Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className='mb-3'>
            <Form.Group as={Col} md={12} controlId='validationCustomNome'>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                required
                type='text'
                name='nome'
                placeholder='Digite o nome da Disciplina'
                defaultValue={selected?.nome}
              />
              <Form.Control.Feedback type='invalid'>
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={onHide}>
            Fechar
          </Button>
          <Button variant='outline-dark' type='reset'>
            Limpar
          </Button>
          <Button type='submit'>Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
