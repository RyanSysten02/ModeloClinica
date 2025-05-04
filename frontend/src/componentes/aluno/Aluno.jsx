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

function FormularioAluno({ show, onHide, onAlunosAtualizados }) {
    const [aluno, setAluno] = useState({
        nome: "",
        cpf: "",
        rg: "",
        dataNascimento: "",
        sexo: "",
        numeroBeneficio: "",
        alunoTurma: "",
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

        setAluno({ ...aluno, [name]: novoValor });

        if (name === "cpf" && !validarCPF(novoValor)) {
            setErros({ ...erros, cpf: "CPF inválido." });
        } else if (name === "email" && !validarEmail(value)) {
            setErros({ ...erros, email: "E-mail inválido." });
        } else if ((name === "telefone" || name === "celular") && !validarTelefone(novoValor)) {
            setErros({ ...erros, [name]: "Número de telefone inválido." });
        } else {
            setErros({ ...erros, [name]: "" });
        }
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
        const dadosAluno = {
            ...aluno,
            cpf: removerMascara(aluno.cpf),
            celular: removerMascara(aluno.celular),
            telefone: removerMascara(aluno.telefone),
        };

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMensagemErro("Token de autenticação não encontrado. Faça login novamente.");
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:5001/api/aluno/cadastraaluno", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dadosAluno),
            });

            const data = await response.json();

            if (response.ok) {
                setAluno({
                    nome: "",
                    cpf: "",
                    rg: "",
                    dataNascimento: "",
                    sexo: "",
                    numeroBeneficio: "",
                    alunoTurma: "",
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
                onAlunosAtualizados();

                
            } else {
                setMensagemErro(data.message || "Falha ao adicionar aluno.");
            }
        } catch (error) {
            setMensagemErro("Ocorreu um erro. Tente novamente.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Formulário de Aluno</Modal.Title>
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
                                        value={aluno.nome}
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
                                        value={aluno.cpf}
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
                                        value={aluno.rg}
                                        onChange={handleChange}
                                    />
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
                                        value={aluno.dataNascimento}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-3 text-start">
                                    <Form.Label>Sexo</Form.Label>
                                    <Form.Select
                                        name="sexo"
                                        value={aluno.sexo}
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
                                    <Form.Label>Número do Benefício</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="numeroBeneficio"
                                        value={aluno.numeroBeneficio}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3 text-start">
                                    <Form.Label>Turma</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="alunoTurma"
                                        value={aluno.alunoTurma}
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
                                        value={aluno.endereco}
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
                                        value={aluno.num}
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
                                        value={aluno.complemento}
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
                                        value={aluno.celular}
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
                                        value={aluno.telefone}
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
                                        value={aluno.contatoEmergencia}
                                        onChange={handleChange}
                                    />
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

export default FormularioAluno;
