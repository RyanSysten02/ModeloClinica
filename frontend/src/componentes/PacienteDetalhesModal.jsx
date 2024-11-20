import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PacienteDetalhesModal = ({ show, onHide, paciente, onSave }) => {
  const [formData, setFormData] = useState(paciente);

  useEffect(() => {
    setFormData(paciente);
  }, [paciente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log('Enviando dados para salvar:', formData);  // Log para verificar dados antes de enviar
    onSave(formData);
    onHide();
};


  if (!paciente) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Paciente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="nome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="cpf">
            <Form.Label>CPF</Form.Label>
            <Form.Control
              type="text"
              name="cpf"
              value={formData.cpf || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="rg">
            <Form.Label>RG</Form.Label>
            <Form.Control
              type="text"
              name="rg"
              value={formData.rg || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="dataNascimento">
            <Form.Label>Data de Nascimento</Form.Label>
            <Form.Control
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento ? formData.dataNascimento.split('T')[0] : ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="sexo">
            <Form.Label>Sexo</Form.Label>
            <Form.Control
              type="text"
              name="sexo"
              value={formData.sexo || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="numeroBeneficio">
            <Form.Label>Número do Benefício</Form.Label>
            <Form.Control
              type="text"
              name="numeroBeneficio"
              value={formData.numeroBeneficio || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="planoSaude">
            <Form.Label>Plano de Saúde</Form.Label>
            <Form.Control
              type="text"
              name="planoSaude"
              value={formData.planoSaude || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="endereco">
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              type="text"
              name="endereco"
              value={formData.endereco || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="telefone">
            <Form.Label>Telefone</Form.Label>
            <Form.Control
              type="text"
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="contatoEmergencia">
            <Form.Label>Contato de Emergência</Form.Label>
            <Form.Control
              type="text"
              name="contatoEmergencia"
              value={formData.contatoEmergencia || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="observacoes">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Fechar</Button>
        <Button variant="primary" onClick={handleSubmit}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PacienteDetalhesModal;
