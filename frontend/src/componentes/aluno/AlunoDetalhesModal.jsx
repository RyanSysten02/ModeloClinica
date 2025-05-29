import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import InputMask from 'react-input-mask';

const AlunoDetalhesModal = ({ show, onHide, aluno, onSave }) => {
  const [formData, setFormData] = useState(aluno || {});
  const [mostrarAlertaObrigatorios, setMostrarAlertaObrigatorios] = useState(false);
  const [alertaMensagem, setAlertaMensagem] = useState('');

  useEffect(() => {
    setFormData(aluno || {});
    setMostrarAlertaObrigatorios(false);
    setAlertaMensagem('');
  }, [aluno]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarEmail = (email) => {
    // validação simples de email
    return /\S+@\S+/.test(email);
  };

  const validarTodosCampos = () => {
    const obrigatorios = [
      'nome',
      'cpf',
      'rg',
      'dataNascimento',
      'sexo',
      'numeroBeneficio',
      'alunoTurma',
      'endereco',
      'num',
      'celular',
      'email',
    ];

    for (let campo of obrigatorios) {
      if (!formData[campo] || formData[campo].toString().trim() === '') {
        setAlertaMensagem(`Campo "${campo}" é obrigatório.`);
        return false;
      }
    }

    // Validar formato CPF (básico, só tamanho e dígitos)
    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setAlertaMensagem('CPF inválido.');
      return false;
    }

    // Validar RG numérico
    const rgLimpo = formData.rg.replace(/\D/g, '');
    if (rgLimpo.length < 5) {
      setAlertaMensagem('RG inválido.');
      return false;
    }

    // Validar número (num) como número inteiro positivo
    if (isNaN(formData.num) || Number(formData.num) <= 0) {
      setAlertaMensagem('Número inválido.');
      return false;
    }

    // Validar celular com máscara (11 dígitos)
    const celularLimpo = formData.celular.replace(/\D/g, '');
    if (celularLimpo.length !== 11) {
      setAlertaMensagem('Celular inválido.');
      return false;
    }

    // Validar email
    if (!validarEmail(formData.email)) {
      setAlertaMensagem('Email inválido.');
      return false;
    }

    setAlertaMensagem('');
    return true;
  };

const handleSubmit = async () => {
  if (!validarTodosCampos()) {
    setMostrarAlertaObrigatorios(true);
    return;
  }

  try {
    const formDataCorrigido = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
    };

    setMostrarAlertaObrigatorios(false);
    await onSave(formDataCorrigido);
    onHide();
  } catch (error) {
    const msg = error?.message || 'Erro ao salvar dados. Tente novamente.';
    setAlertaMensagem(msg);
    setMostrarAlertaObrigatorios(true);
  }
};



  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Aluno</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          {mostrarAlertaObrigatorios && (
            <Alert variant="danger">{alertaMensagem || 'Por favor, preencha todos os campos obrigatórios.'}</Alert>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Nome *</Form.Label>
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
                  <Form.Label>CPF *</Form.Label>
                  <InputMask
                    mask="999.999.999-99"
                    value={formData.cpf || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="text"
                        name="cpf"
                      />
                    )}
                  </InputMask>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>RG *</Form.Label>
                  <InputMask
                    mask="999999999"
                    maskChar=""
                    value={formData.rg || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="text"
                        name="rg"
                      />
                    )}
                  </InputMask>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Dt Nascimento *</Form.Label>
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
                  <Form.Label>Sexo *</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={formData.sexo || ''}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outros">Outro</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>RA *</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroBeneficio"
                    value={formData.numeroBeneficio || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Turma *</Form.Label>
                  <Form.Control
                    type="text"
                    name="alunoTurma"
                    value={formData.alunoTurma || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Endereço *</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco"
                    value={formData.endereco || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={1}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Núm.*</Form.Label>
                  <Form.Control
                    type="number"
                    name="num"
                    value={formData.num || ''}
                    onChange={handleChange}
                    min={1}
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    name="complemento"
                    value={formData.complemento || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Celular *</Form.Label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.celular || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="tel"
                        name="celular"
                      />
                    )}
                  </InputMask>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Telefone</Form.Label>
                  <InputMask
                    mask="(99) 9999-9999"
                    value={formData.telefone || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="tel"
                        name="telefone"
                      />
                    )}
                  </InputMask>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>E-mail *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Contato de Emergência</Form.Label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.contatoEmergencia || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="tel"
                        name="contatoEmergencia"
                      />
                    )}
                  </InputMask>
                </Form.Group>
              </Col>
            </Row>
            <Row>
            <Col md={12}>
                <Form.Group className="mb-3 text-start">
                    <Form.Label>Observações</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="observacoes"
                        value={aluno.observacoes}
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
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlunoDetalhesModal;
