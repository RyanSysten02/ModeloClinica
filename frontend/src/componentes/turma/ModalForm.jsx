import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

export const ModalForm = ({ show, onHide, onSave, selected }) => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const isValid = form.checkValidity();

    if (!isValid) {
      event.stopPropagation();
    }

    setValidated(true);

    if (isValid) {
      const formData = new FormData(event.target);
      // Removido periodo, adicionado nivel
      const payload = {
        nome: formData.get('nome'),
        nivel: formData.get('nivel'), 
        ano_letivo: formData.get('ano_letivo'),
        semestre: formData.get('semestre'),
        status: formData.get('status'),
      };

      onSave(payload);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size='xl'>
      <Modal.Header closeButton>
        <Modal.Title>{selected ? 'Editar Turma' : 'Cadastrar Turma'}</Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className='mb-3'>
            <Form.Group as={Col} md={8} controlId='validationCustomNome'>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                required
                type='text'
                name='nome'
                placeholder='Ex: 1º Ano A'
                defaultValue={selected?.nome}
              />
              <Form.Control.Feedback type='invalid'>
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId='validationCustomNivel'>
              <Form.Label>Nível de Ensino</Form.Label>
              <Form.Select
                name='nivel'
                required
                defaultValue={selected?.nivel ?? ''}
              >
                <option value='' disabled>Selecione o nível</option>
                <option value='Anos Iniciais'>Anos Iniciais</option>
                <option value='Anos Finais'>Anos Finais</option>
                <option value='Ensino Médio'>Ensino Médio</option>
              </Form.Select>
              <Form.Control.Feedback type='invalid'>
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className='mb-3'>
            <Form.Group as={Col} md={4} controlId='validationCustomAnoLetivo'>
              <Form.Label>Ano Letivo</Form.Label>
              <Form.Control
                type="number"
                name='ano_letivo'
                placeholder='Ex: 2025'
                required
                defaultValue={selected?.ano_letivo ?? new Date().getFullYear()}
              />
              <Form.Control.Feedback type='invalid'>
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId='validationCustomSemestre'>
              <Form.Label>Semestre</Form.Label>
              <Form.Select
                name='semestre'
                required
                defaultValue={selected?.semestre ?? ''}
              >
                <option value='' disabled>Selecione</option>
                <option value='1'>1º Semestre</option>
                <option value='2'>2º Semestre</option>
              </Form.Select>
              <Form.Control.Feedback type='invalid'>
                Campo obrigatório
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId='validationCustomStatus'>
              <Form.Label>Status</Form.Label>
              <Form.Select
                required
                name='status'
                defaultValue={selected?.status ?? ''}
              >
                <option value='' disabled>Escolha o status</option>
                <option value='Não iniciada'>Não iniciada</option>
                <option value='Em andamento'>Em andamento</option>
                <option value='Concluída'>Concluída</option>
                <option value='Encerrada'>Encerrada</option>
              </Form.Select>
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
          <Button variant='outline-dark' type='reset' onClick={() => setValidated(false)}>
            Limpar
          </Button>
          <Button type='submit'>Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};