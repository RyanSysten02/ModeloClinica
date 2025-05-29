import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import DisciplinaService from "../../services/Disciplina";

function FormularioProfessor({ show, onHide, onCadastroSuccess }) {
  const [professor, setProfessor] = useState({
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
    telefone: "",
    email: "",
    sexo: "",
  });

  const [listaDisciplinas, setListaDisciplinas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const disciplinas = await DisciplinaService.findAll();
        setListaDisciplinas(disciplinas);
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
      }
    };
    fetchDisciplinas();
  }, []);

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
    "email",
    "sexo",
  ];

  const validarCampos = () => {
    for (const campo of camposObrigatorios) {
      const valor = professor[campo];
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
      novoValor = aplicarMascara(value, "#########");
    } else if (name === "cep") {
      novoValor = aplicarMascara(value, "#####-###");
    } else if (name === "telefone") {
      novoValor = aplicarMascara(value, "(##) #####-####");
    }

    setProfessor({ ...professor, [name]: novoValor });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro("");

    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setMensagemErro(erroValidacao);
      return;
    }

    onHide();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token de autenticação não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/professor/cadastraprofessor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(professor),
      });

      const data = await response.json();

      if (response.ok) {
        setProfessor({
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
          telefone: "",
          email: "",
          sexo: "",
        });

        if (onCadastroSuccess) onCadastroSuccess();

        navigate("/pagProfessor");
      } else {
        toast.warning(data.message || "Falha ao adicionar funcionário");
      }
    } catch (error) {
      setMensagemErro("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Cadastro de Professor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          {mensagemErro && (
            <div className="alert alert-danger">{mensagemErro}</div>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              {[{
                label: "Nome*", name: "nome", md: 6
              }, {
                label: "CPF*", name: "cpf", md: 3
              }, {
                label: "RG*", name: "rg", md: 3
              }, {
                label: "Endereço*", name: "end_rua", md: 6
              }, {
                label: "Número*", name: "end_numero", md: 1
              }, {
                label: "Bairro*", name: "bairro", md: 2
              }, {
                label: "Cidade*", name: "cidade", md: 3
              }, {
                label: "CEP*", name: "cep", md: 2
              }, {
                label: "Data de Nascimento*", name: "data_nasc", md: 2, type: "date"
              }, {
                label: "Número de Registro (CRE)*", name: "num_regis", md: 3
              }].map(({ label, name, md, type = "text" }) => (
                <Col md={md} key={name}>
                  <Form.Group className="mb-3 text-start">
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      type={type}
                      name={name}
                      value={professor[name]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              ))}

              <Col md={5}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Disciplina*</Form.Label>
                  <Form.Select
                    name="habilitacao"
                    value={professor.habilitacao}
                    onChange={handleChange}
                  >
                    <option value="">Selecione uma disciplina</option>
                    {listaDisciplinas.map((disciplina) => (
                      <option key={disciplina.id} value={disciplina.nome}>
                        {disciplina.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Sexo*</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={professor.sexo}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {[{
                label: "Telefone*", name: "telefone", md: 4
              }, {
                label: "Email*", name: "email", md: 4
              }, {
                label: "Especializações", name: "especializacao", md: 12
              }, {
                label: "Cursos e Experiências", name: "cursos", md: 12
              }].map(({ label, name, md }) => (
                <Col md={md} key={name}>
                  <Form.Group className="mb-3 text-start">
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      type="text"
                      name={name}
                      value={professor[name]}
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

export default FormularioProfessor;
