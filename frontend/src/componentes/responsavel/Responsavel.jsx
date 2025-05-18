import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  validarCPF,
  aplicarMascaraCPF,
  validarTelefone,
  aplicarMascaraTelefone,
  validarEmail,
} from "./validacoes";

function FormularioResponsavel({ show, onHide, onResponsavelsAtualizados }) {
  const [responsavel, setResponsavel] = useState({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    sexo: "",
    numeroBeneficio: "",
    responsavelTurma: "",
    endereco: "",
    num: "",
    complemento: "",
    celular: "",
    telefone: "",
    email: "",
    contatoEmergencia: "",
    observacoes: "",
  });

  const [mensagemErro, setMensagemErro] = useState("");
  const [erros, setErros] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false); 

  const navigate = useNavigate();


  const camposObrigatorios = [
    "nome",
    "cpf",
    "rg",
    "dataNascimento",
    "sexo",
    "responsavelTurma",
    "endereco",
  ];

  const validarCampos = () => {
    const novosErros = {};

    camposObrigatorios.forEach((campo) => {
      const valor = responsavel[campo];
      if (!valor || String(valor).trim() === "") {
        novosErros[campo] = "Campo obrigatório";
      }
    });

    if (responsavel.cpf && !validarCPF(responsavel.cpf)) {
      novosErros.cpf = "CPF inválido";
    }
    if (responsavel.email && !validarEmail(responsavel.email)) {
      novosErros.email = "E-mail inválido";
    }
    if (responsavel.telefone && !validarTelefone(responsavel.telefone)) {
      novosErros.telefone = "Número de telefone inválido";
    }
    if (responsavel.celular && !validarTelefone(responsavel.celular)) {
      novosErros.celular = "Número de celular inválido";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cpf") {
      novoValor = aplicarMascaraCPF(value);
    } else if (name === "telefone" || name === "celular") {
      novoValor = aplicarMascaraTelefone(value);
    }

    setResponsavel((prev) => ({
      ...prev,
      [name]: novoValor,
    }));

    if (submitAttempted) {
      setErros((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const removerMascara = (valor) => valor.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro("");
    setSubmitAttempted(true); 

    if (!validarCampos()) {
      return; 
    }

    const dadosResponsavel = {
      ...responsavel,
      cpf: removerMascara(responsavel.cpf),
      celular: removerMascara(responsavel.celular),
      telefone: removerMascara(responsavel.telefone),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro(
          "Token de autenticação não encontrado. Faça login novamente."
        );
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5001/api/responsavel/cadastraresponsavel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dadosResponsavel),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResponsavel({
          nome: "",
          cpf: "",
          rg: "",
          dataNascimento: "",
          sexo: "",
          numeroBeneficio: "",
          responsavelTurma: "",
          endereco: "",
          num: "",
          complemento: "",
          celular: "",
          telefone: "",
          email: "",
          contatoEmergencia: "",
          observacoes: "",
        });

        setErros({});
        setSubmitAttempted(false); 
        onHide();
        onResponsavelsAtualizados();
      } else {
        setMensagemErro(data.message || "Falha ao adicionar responsável.");
      }
    } catch (error) {
      setMensagemErro("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Formulário de Responsável</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          {submitAttempted && Object.keys(erros).length > 0 && (
            <Alert variant="danger">
              Preencha todos os campos obrigatórios.
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Nome*</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={responsavel.nome}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.nome}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.nome}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>CPF*</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={responsavel.cpf}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.cpf}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.cpf}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>RG*</Form.Label>
                  <Form.Control
                    type="text"
                    name="rg"
                    value={responsavel.rg}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.rg}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.rg}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Dt Nascimento*</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataNascimento"
                    value={responsavel.dataNascimento}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.dataNascimento}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.dataNascimento}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Sexo*</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={responsavel.sexo}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.sexo}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outros">Outro</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {erros.sexo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Número do Benefício</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroBeneficio"
                    value={responsavel.numeroBeneficio}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Turma*</Form.Label>
                  <Form.Control
                    type="text"
                    name="responsavelTurma"
                    value={responsavel.responsavelTurma}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.responsavelTurma}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.responsavelTurma}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Endereço*</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco"
                    value={responsavel.endereco}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.endereco}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.endereco}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={1}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    name="num"
                    value={responsavel.num}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    name="complemento"
                    value={responsavel.complemento}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Celular</Form.Label>
                  <Form.Control
                    type="tel"
                    name="celular"
                    value={responsavel.celular}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.celular}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.celular}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefone"
                    value={responsavel.telefone}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.telefone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.telefone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={responsavel.email}
                    onChange={handleChange}
                    isInvalid={submitAttempted && !!erros.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Contato Emergência</Form.Label>
                  <Form.Control
                    type="text"
                    name="contatoEmergencia"
                    value={responsavel.contatoEmergencia}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observacoes"
                    value={responsavel.observacoes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onHide} className="me-2">
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Salvar
              </Button>
            </div>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default FormularioResponsavel;
