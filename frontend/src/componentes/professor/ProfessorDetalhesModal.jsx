import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import InputMask from "react-input-mask";

const camposObrigatorios = [
  "nome",
  "cpf",
  "rg",
  "data_nasc",
  "end_rua",
  "end_numero",
  "bairro",
  "cidade",
  "num_regis",
  "habilitacao",
  "telefone",
  "sexo",
  "email",
];

const ProfessorDetalhesModal = ({ show, onHide, professor, onSave }) => {
  const [formData, setFormData] = useState(professor);
  const [erros, setErros] = useState({});

  useEffect(() => {
    setFormData(professor);
    setErros({});
  }, [professor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarCampos = () => {
    const novosErros = {};
    camposObrigatorios.forEach((campo) => {
      const valor = formData[campo];
      if (!valor || String(valor).trim() === "") {
        novosErros[campo] = "Campo obrigatório";
      }
    });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (validarCampos()) {
      onSave(formData);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Dados do Professor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          {Object.keys(erros).length > 0 && (
            <Alert variant="danger">
              Preencha todos os campos obrigatórios.
            </Alert>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Nome*</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={formData.nome || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.nome}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.nome}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>CPF*</Form.Label>
                  <InputMask
                    mask="999.999.999-99"
                    value={formData.cpf || ""}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="text"
                        name="cpf"
                        isInvalid={!!erros.cpf}
                      />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type="invalid">
                    {erros.cpf}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>RG*</Form.Label>
                  <InputMask
                    value={formData.rg || ""}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="text"
                        name="rg"
                        isInvalid={!!erros.rg}
                      />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type="invalid">
                    {erros.rg}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Endereço*</Form.Label>
                  <Form.Control
                    type="text"
                    name="end_rua"
                    value={formData.end_rua || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.end_rua}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.end_rua}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Número*</Form.Label>
                  <Form.Control
                    type="text"
                    name="end_numero"
                    value={formData.end_numero || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.end_numero}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.end_numero}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Bairro*</Form.Label>
                  <Form.Control
                    type="text"
                    name="bairro"
                    value={formData.bairro || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.bairro}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.bairro}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Cidade*</Form.Label>
                  <Form.Control
                    type="text"
                    name="cidade"
                    value={formData.cidade || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.cidade}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.cidade}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>CEP</Form.Label>
                  <InputMask
                    mask="99999-999"
                    value={formData.cep || ""}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control {...inputProps} type="text" name="cep" />
                    )}
                  </InputMask>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Data de Nascimento*</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_nasc"
                    value={
                      formData.data_nasc
                        ? formData.data_nasc.split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    isInvalid={!!erros.data_nasc}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.data_nasc}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Telefone*</Form.Label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.telefone || ""}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        type="text"
                        name="telefone"
                        isInvalid={!!erros.telefone}
                      />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type="invalid">
                    {erros.telefone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Email*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Sexo*</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={formData.sexo || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.sexo}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {erros.sexo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Número de Registro (CRE)*</Form.Label>
                  <Form.Control
                    type="text"
                    name="num_regis"
                    value={formData.num_regis || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.num_regis}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.num_regis}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Habilitação*</Form.Label>
                  <Form.Control
                    type="text"
                    name="habilitacao"
                    value={formData.habilitacao || ""}
                    onChange={handleChange}
                    isInvalid={!!erros.habilitacao}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.habilitacao}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Especializações</Form.Label>
                  <Form.Control
                    type="text"
                    name="especializacao"
                    value={formData.especializacao || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Cursos e Experiências</Form.Label>
                  <Form.Control
                    type="text"
                    name="cursos"
                    value={formData.cursos || ""}
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

export default ProfessorDetalhesModal;
