import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cpf") {
      novoValor = aplicarMascaraCPF(value);
    } else if (name === "telefone" || name === "celular") {
      novoValor = aplicarMascaraTelefone(value);
    }

    console.log({ name, novoValor });

    if (name === "nome" && !novoValor) {
      setErros({ ...erros, [name]: "Nome obrigatório" });
    } else if (name === "rg" && !novoValor) {
      setErros({ ...erros, [name]: "RG obrigatório." });
    } else if (name === "dataNascimento" && !novoValor) {
      setErros({ ...erros, [name]: "Data de nascimento obrigatório." });
    } else if (name === "sexo" && !novoValor) {
      setErros({ ...erros, [name]: "Sexo obrigatório." });
    } else if (name === "responsavelTurma" && !novoValor) {
      setErros({ ...erros, [name]: "Turma obrigatório." });
    } else if (name === "rg" && !novoValor) {
    } else if (name === "endereco" && !novoValor) {
      setErros({ ...erros, [name]: "Endereço obrigatório." });
    } else if (name === "rg" && !novoValor) {
      setErros({ ...erros, [name]: "RG obrigatório." });
    } else if (name === "cpf" && !validarCPF(novoValor)) {
      setErros({ ...erros, [name]: "CPF inválido." });
    } else if (name === "email" && !validarEmail(value)) {
      setErros({ ...erros, [name]: "E-mail inválido." });
    } else if (
      (name === "telefone" || name === "celular") &&
      !validarTelefone(novoValor)
    ) {
      setErros({ ...erros, [name]: "Número de telefone inválido." });
    } else {
      setErros({ ...erros, [name]: "" });
    }

    setResponsavel({ ...responsavel, [name]: novoValor });
  };

  const removerMascara = (valor) => valor.replace(/\D/g, ""); // Remove tudo que não for número

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro("");

    if (Object.values(erros).some((erro) => erro)) {
      alert("Corrija os erros antes de salvar.");
      return;
    }

    // Prepara os dados antes de enviar (remove máscaras de CPF e telefone)
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

        onHide();
        onResponsavelsAtualizados();
      } else {
        setMensagemErro(data.message || "Falha ao adicionar responsavel.");
      }
    } catch (error) {
      setMensagemErro("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Formulário de Responsavel</Modal.Title>
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
                    value={responsavel.nome}
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
                  <Form.Label>CPF</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={responsavel.cpf}
                    onChange={handleChange}
                    isInvalid={!!erros.cpf}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.cpf}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>RG</Form.Label>
                  <Form.Control
                    type="text"
                    name="rg"
                    value={responsavel.rg}
                    onChange={handleChange}
                    isInvalid={!!erros.rg}
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
                  <Form.Label>Dt Nascimento</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataNascimento"
                    value={responsavel.dataNascimento}
                    onChange={handleChange}
                    isInvalid={!!erros.dataNascimento}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.dataNascimento}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={responsavel.sexo}
                    onChange={handleChange}
                    isInvalid={!!erros.sexo}
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
                  <Form.Label>Turma</Form.Label>
                  <Form.Control
                    type="text"
                    name="responsavelTurma"
                    value={responsavel.responsavelTurma}
                    onChange={handleChange}
                    isInvalid={!!erros.responsavelTurma}
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
                  <Form.Label>Endereço</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco"
                    value={responsavel.endereco}
                    onChange={handleChange}
                    isInvalid={!!erros.endereco}
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
                    isInvalid={!!erros.celular}
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
                    isInvalid={!!erros.telefone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.telefone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Contato Emergência</Form.Label>
                  <Form.Control
                    type="text"
                    name="contatoEmergencia"
                    value={responsavel.contatoEmergencia}
                    onChange={handleChange}
                    isInvalid={!!erros.contatoEmergencia}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.contatoEmergencia}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="observacoes"
                    value={responsavel.observacoes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={Object.values(erros).some((erro) => erro)}
            >
              Salvar
            </Button>
          </Form>
        </Container>
        {mensagemErro && <div className="text-danger mt-3">{mensagemErro}</div>}
      </Modal.Body>
    </Modal>
  );
}

export default FormularioResponsavel;
