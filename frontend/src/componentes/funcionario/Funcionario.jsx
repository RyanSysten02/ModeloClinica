import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function FormularioFuncionario({ show, onHide, onCadastroSuccess }) {
  const [funcionario, setFuncionario] = useState({
    nome: "",
    cpf: "",
    rg: "",
    end_rua: "",
    end_numero: "",
    bairro: "",
    cidade: "",
    cep: "",
    data_nasc: "",
    num_regis: "",
    habilitacao: "",
    especializacao: "",
    cursos: "",
  });

  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

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
  ];

  const validarCampos = () => {
    for (const campo of camposObrigatorios) {
      const valor = funcionario[campo];
      if (!valor || typeof valor !== "string" || valor.trim() === "") {
        return `O campo ${campo} é obrigatório.`;
      }
    }
    return null;
  };

  const aplicarMascara = (value, mascara) => {
    let i = 0;
    const v = value.replace(/\D/g, "");
    return mascara.replace(/#/g, () => v[i++] || "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let novoValor = value;

    if (name === "cpf") {
      novoValor = aplicarMascara(value, "###.###.###-##");
    } else if (name === "rg") {
      novoValor = aplicarMascara(value, "##.###.###-#");
    } else if (name === "cep") {
      novoValor = aplicarMascara(value, "#####-###");
    }

    setFuncionario({ ...funcionario, [name]: novoValor });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro("");

    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setMensagemErro(erroValidacao);
      return;
    }

    onHide(); // Fechar o modal

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
        "http://localhost:5001/api/funcionario/cadastrafuncionario",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(funcionario),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFuncionario({
          nome: "",
          cpf: "",
          rg: "",
          end_rua: "",
          end_numero: "",
          bairro: "",
          cidade: "",
          cep: "",
          data_nasc: "",
          num_regis: "",
          habilitacao: "",
          especializacao: "",
          cursos: "",
        });

        if (onCadastroSuccess) {
          onCadastroSuccess();
        }

        navigate("/pagFuncionario");
      } else {
        setMensagemErro(data.message || "Falha ao adicionar funcionário");
      }
    } catch (error) {
      setMensagemErro("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Formulário de Funcionário</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          <h1>Formulário de Funcionário</h1>
          {mensagemErro && (
            <div className="alert alert-danger">{mensagemErro}</div>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Campos - mesmo layout original, com value e onChange atualizados */}
              {[
                { label: "Nome*", name: "nome", md: 6 },
                { label: "CPF*", name: "cpf", md: 3 },
                { label: "RG*", name: "rg", md: 3 },
                { label: "Endereço", name: "end_rua", md: 6 },
                { label: "Número", name: "end_numero", md: 1 },
                { label: "Bairro", name: "bairro", md: 2 },
                { label: "Cidade", name: "cidade", md: 3 },
                { label: "CEP", name: "cep", md: 2 },
                {
                  label: "Data de Nascimento",
                  name: "data_nasc",
                  md: 2,
                  type: "date",
                },
                { label: "Número de Registro(CRE)", name: "num_regis", md: 3 },
                { label: "Habilitação", name: "habilitacao", md: 5 },
                { label: "Especializações", name: "especializacao", md: 12 },
                { label: "Cursos e Experiências", name: "cursos", md: 12 },
              ].map(({ label, name, md, type = "text" }) => (
                <Col md={md} key={name}>
                  <Form.Group className="mb-3 text-start">
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      type={type}
                      name={name}
                      value={funcionario[name]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              ))}
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
}

export default FormularioFuncionario;
