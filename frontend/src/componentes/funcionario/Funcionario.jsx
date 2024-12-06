import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function FormularioFuncionario({ show, onHide, onCadastroSuccess }) {
  const [funcionario, setFuncionario] = useState({
    nome: "",
    matricula: "",
    funcao: "", 
    habilitacao: "", 
    dataNascimento: "",
  });

  const [mensagemErro, setMensagemErro] = useState('');
  const navigate = useNavigate();
  const [erros, setErros] = useState({ matricula: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFuncionario({ ...funcionario, [name]: value });

    // Validação do CPF em tempo real
    if (name === "matricula") {
      if (!validarCPF(value)) {
        setErros({ ...erros, matricula: "CPF inválido." });
      } else {
        setErros({ ...erros, matricula: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    onHide();  // Fechar o modal
  
    if (erros.matricula) {
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
  
      const response = await fetch('http://localhost:5001/api/funcionario/cadastrafuncionario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(funcionario),
      });
  
      const data = await response.json();
      console.log("Resposta recebida:", data);
  
      if (response.ok) {
        setFuncionario({
          nome: "",
          matricula: "",
          funcao: "", 
          habilitacao: "", 
          dataNascimento: "",
        });
  
        // Chama a função onCadastroSuccess do componente pai
        if (onCadastroSuccess) {
          onCadastroSuccess();  // Atualiza a lista
        }
  
        navigate('/pagFuncionario');
      } else {
        setMensagemErro(data.message || 'Falha ao adicionar funcionário');
      }
    } catch (error) {
      setMensagemErro('Ocorreu um erro. Tente novamente.');
    }
  };

  const validarCPF = (matricula) => {
    matricula = matricula.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    if (matricula.length !== 11 || /^(\d)\1+$/.test(matricula)) return false;

    let soma, resto;
    soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(matricula.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(matricula.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(matricula.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(matricula.substring(10, 11))) return false;

    return true;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Formulário de Funcionário</Modal.Title>
      </Modal.Header> 
      <Modal.Body>
        <Container className="mt-4">
          <h1>Formulário de Funcionário</h1>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={funcionario.nome}
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
                    value={funcionario.matricula}
                    onChange={handleChange}
                    isInvalid={!!erros.matricula}
                  />
                  <Form.Control.Feedback type="invalid">
                    {erros.matricula}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Função</Form.Label>
                  <Form.Control
                    type="text"
                    name="funcao"
                    value={funcionario.funcao}
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
                    value={funcionario.habilitacao}
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
                    value={funcionario.dataNascimento}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Fechar</Button>
        <Button variant="primary" onClick={handleSubmit}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormularioFuncionario;
