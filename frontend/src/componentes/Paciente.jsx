import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

function FormularioPaciente({onPaciente}){
  const [paciente, setPaciente] = useState({
    nome: "",
    cpf: "",
  });

  const [mensagemErro, setMensagemErro] = useState('');
  const navigate = useNavigate();
  const [erros, setErros] = useState({ cpf: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente({ ...paciente, [name]: value });

    // Validação do CPF em tempo real
    if (name === "cpf") {
      if (!validarCPF(value)) {
        setErros({ ...erros, cpf: "CPF inválido." });
      } else {
        setErros({ ...erros, cpf: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    console.log("Paciente enviado:", paciente);

    if (erros.cpf) {
        alert("Corrija os erros antes de salvar.");
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            setMensagemErro('Token de autenticação não encontrado. Faça login novamente.');
            navigate('/login');
            return;
        }

        const response = await fetch('http://localhost:5001/api/paciente/cadastrapaciente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(paciente),
        });

        const data = await response.json();
        console.log("Resposta recebida:", data);

        if (response.ok) {
            onPaciente(paciente);
            setPaciente({
                nome: "",
                cpf: "",
                
            });
            navigate('/paginicial');
        } else {
            setMensagemErro(data.message || 'Falha ao adicionar paciente');
        }
    } catch (error) {
        setMensagemErro('Ocorreu um erro. Tente novamente.');
    }
};


  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma, resto;
    soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  return (
    <Container className="mt-4">
      <h1>Formulário de Paciente</h1>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={paciente.nome}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>CPF</Form.Label>
              <Form.Control
                type="text"
                name="cpf"
                value={paciente.cpf}
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
                value={paciente.rg}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          
          <Col md={2}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control
                type="date"
                name="dataNascimento"
                value={paciente.dataNascimento}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Sexo</Form.Label>
              <Form.Select
                name="sexo"
                value={paciente.sexo}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Número do Benefício</Form.Label>
              <Form.Control
                type="text"
                name="numeroBeneficio"
                value={paciente.numeroBeneficio}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Plano de Saúde</Form.Label>
              <Form.Control
                type="text"
                name="planoSaude"
                value={paciente.planoSaude}
                onChange={handleChange}
              />
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
                value={paciente.endereco}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={1}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Número</Form.Label>
              <Form.Control
                type="text"
                name="num"
                value={paciente.num}
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
                value={paciente.complemento}
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
                value={paciente.celular}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="tel"
                name="telefone"
                value={paciente.telefone}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={paciente.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3 text-start">
              <Form.Label>Contato de Emergência</Form.Label>
              <Form.Control
                type="tel"
                name="contatoEmergencia"
                value={paciente.contatoEmergencia}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3 text-start">
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="observacoes"
            value={paciente.observacoes}
            onChange={handleChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Salvar
        </Button>
      </Form>
    </Container>
  );
};

export default FormularioPaciente;
