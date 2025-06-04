import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Container,
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import InputMask from 'react-input-mask';

const camposObrigatorios = [
  'nome',
  'cpf',
  'rg',
  'dataNascimento',
  'endereco',
  'num',
];

const ResponsavelDetalhesModal = ({ show, onHide, responsavel, onSave }) => {
  const [formData, setFormData] = useState(responsavel);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setFormData(responsavel);
    setErrors({});
  }, [responsavel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validarCampos = () => {
    const novosErros = {};
    camposObrigatorios.forEach((campo) => {
      if (!formData[campo] || formData[campo].toString().trim() === '') {
        novosErros[campo] = 'Campo obrigatório';
      }
    });
    console.log(novosErros);
    setErrors(novosErros);
    setShowAlert(Object.keys(novosErros).length > 0);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (validarCampos()) {
      onSave(formData);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size='xl'>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Responsável</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className='mt-4'>
          {showAlert && (
            <Alert variant='danger'>
              Preencha todos os campos obrigatórios.
            </Alert>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Nome*</Form.Label>
                  <Form.Control
                    type='text'
                    name='nome'
                    value={formData.nome || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.nome}
                  />
                  <Form.Control.Feedback type='invalid'>
                    {errors.nome}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>CPF*</Form.Label>
                  <InputMask
                    mask='999.999.999-99'
                    className='form-control'
                    name='cpf'
                    value={formData.cpf || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control {...inputProps} isInvalid={!!errors.cpf} />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type='invalid'>
                    {errors.cpf}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Dt Nascimento*</Form.Label>
                  <Form.Control
                    type='date'
                    name='dataNascimento'
                    value={
                      formData.dataNascimento
                        ? formData.dataNascimento.split('T')[0]
                        : ''
                    }
                    onChange={handleChange}
                    isInvalid={!!errors.dataNascimento}
                  />
                  <Form.Control.Feedback type='invalid'>
                    {errors.dataNascimento}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select
                    name='sexo'
                    value={formData.sexo || ''}
                    onChange={handleChange}
                  >
                    <option value=''>Selecione</option>
                    <option value='Masculino'>Masculino</option>
                    <option value='Feminino'>Feminino</option>
                    <option value='Outros'>Outro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>RG*</Form.Label>
                  <InputMask
                    mask='99.999.999-9'
                    className='form-control'
                    name='rg'
                    value={formData.rg || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control {...inputProps} isInvalid={!!errors.rg} />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type='invalid'>
                    {errors.rg}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Endereço*</Form.Label>
                  <Form.Control
                    type='text'
                    name='endereco'
                    value={formData.endereco || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.endereco}
                  />
                  <Form.Control.Feedback type='invalid'>
                    {errors.endereco}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Número*</Form.Label>
                  <Form.Control
                    type='text'
                    name='num'
                    value={formData.num || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.num}
                  />
                  <Form.Control.Feedback type='invalid'>
                    {errors.num}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type='text'
                    name='complemento'
                    value={formData.complemento || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Celular</Form.Label>
                  <InputMask
                    mask='(99) 99999-9999'
                    className='form-control'
                    name='celular'
                    value={formData.celular || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => <Form.Control {...inputProps} />}
                  </InputMask>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Telefone</Form.Label>
                  <InputMask
                    mask='(99) 9999-9999'
                    className='form-control'
                    name='telefone'
                    value={formData.telefone || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => <Form.Control {...inputProps} />}
                  </InputMask>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type='email'
                    name='email'
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className='mb-3 text-start'>
                  <Form.Label>Contato de Emergência</Form.Label>
                  <InputMask
                    mask='(99) 99999-9999'
                    className='form-control'
                    name='contatoEmergencia'
                    value={formData.contatoEmergencia || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => <Form.Control {...inputProps} />}
                  </InputMask>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3 text-start'>
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                name='observacoes'
                value={formData.observacoes || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Fechar
        </Button>
        <Button variant='primary' onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResponsavelDetalhesModal;
