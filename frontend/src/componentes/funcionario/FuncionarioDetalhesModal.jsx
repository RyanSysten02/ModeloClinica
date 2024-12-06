import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';

const FuncionarioDetalhesModal = ({ show, onHide, funcionario, onSave }) => {
  const [formData, setFormData] = useState(funcionario);

  useEffect(() => {
    setFormData(funcionario);
  }, [funcionario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl"> {/* Aumentando a largura do modal */}
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Funcionário</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={formData.nome || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Matricula</Form.Label>
                  <Form.Control
                    type="text"
                    name="matricula"
                    value={formData.matricula || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Função</Form.Label>
                  <Form.Control
                    type="text"
                    name="funcao"
                    value={formData.funcao || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Habilitação</Form.Label>
                  <Form.Control
                    type="text"
                    name="habilitacao"
                    value={formData.habilitacao || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Dt Nascimento</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento ? formData.dataNascimento.split('T')[0] : ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Control
                    as="select"
                    name="sexo"
                    value={formData.sexo || ''}
                    onChange={handleChange}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefone"
                    value={formData.telefone || ''}
                    onChange={handleChange}
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
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FuncionarioDetalhesModal;
