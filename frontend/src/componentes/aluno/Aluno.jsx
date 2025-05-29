import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
        endereco: "",
        num: "",
        complemento: "",
        celular: "",
        telefone: "",
        email: "",
        contatoEmergencia: "",
        observacoes: "",
    });

    const [erros, setErros] = useState({});
    const [mensagemErro, setMensagemErro] = useState("");
    const [mostrarAlertaObrigatorios, setMostrarAlertaObrigatorios] = useState(false);
    const navigate = useNavigate();

    const camposObrigatorios = [
        "nome",
        "cpf",
        "rg",
        "dataNascimento",
        "sexo",
        "numeroBeneficio",
        "endereco",
        "num",
        "celular",
        "email"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        let novoValor = value;

        if (name === "cpf") {
            novoValor = aplicarMascaraCPF(value);
        } else if (name === "telefone" || name === "celular") {
            novoValor = aplicarMascaraTelefone(value);
        }

        setAluno((prev) => ({ ...prev, [name]: novoValor }));

        validarCampo(name, novoValor);
    };

    const validarCampo = (campo, valor) => {
        let mensagem = "";

        if (camposObrigatorios.includes(campo) && !valor.trim()) {
            mensagem = "Campo obrigatório.";
        } else if (campo === "cpf" && !validarCPF(valor)) {
            mensagem = "CPF inválido.";
        } else if ((campo === "telefone" || campo === "celular") && !validarTelefone(valor)) {
            mensagem = "Telefone inválido.";
        } else if (campo === "email" && !validarEmail(valor)) {
            mensagem = "E-mail inválido.";
        }

        setErros((prevErros) => ({
            ...prevErros,
            [campo]: mensagem,
        }));
    };

    const removerMascara = (valor) => valor.replace(/\D/g, "");

    const validarTodosCampos = () => {
        const novosErros = {};

        for (const campo of camposObrigatorios) {
            if (!aluno[campo].trim()) {
                novosErros[campo] = "Campo obrigatório.";
            }
        }

        if (aluno.cpf && !validarCPF(aluno.cpf)) {
            novosErros.cpf = "CPF inválido.";
        }
        if (aluno.celular && !validarTelefone(aluno.celular)) {
            novosErros.celular = "Telefone inválido.";
        }
        if (aluno.telefone && aluno.telefone.trim() && !validarTelefone(aluno.telefone)) {
            novosErros.telefone = "Telefone inválido.";
        }
        if (aluno.email && !validarEmail(aluno.email)) {
            novosErros.email = "E-mail inválido.";
        }

        setErros(novosErros);

        // Mostrar alerta se houver algum campo obrigatório não preenchido
        const temCampoObrigatorioVazio = camposObrigatorios.some(
            (campo) => !aluno[campo].trim()
        );
        setMostrarAlertaObrigatorios(temCampoObrigatorioVazio);

        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro("");
        setMostrarAlertaObrigatorios(false);

        if (!validarTodosCampos()) {
            return;
        }

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
                toast.success("Aluno cadastrado com sucesso!");
                setAluno({
                    nome: "",
                    cpf: "",
                    rg: "",
                    dataNascimento: "",
                    sexo: "",
                    numeroBeneficio: "",
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
                    {mostrarAlertaObrigatorios && (
                        <Alert variant="danger" className="mb-3">
                            Preencha todos os campos obrigatórios.
                        </Alert>
                    )}
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3 text-start">
                                    <Form.Label>Nome *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nome"
                                        value={aluno.nome}
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
                                    <Form.Label>CPF *</Form.Label>
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
                                    <Form.Label>RG *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="rg"
                                        value={aluno.rg}
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
                                    <Form.Label>Dt Nascimento *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dataNascimento"
                                        value={aluno.dataNascimento}
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
                                    <Form.Label>Sexo *</Form.Label>
                                    <Form.Select
                                        name="sexo"
                                        value={aluno.sexo}
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
                                    <Form.Label>RA *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="numeroBeneficio"
                                        value={aluno.numeroBeneficio}
                                        onChange={handleChange}
                                        isInvalid={!!erros.numeroBeneficio}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {erros.numeroBeneficio}
                                    </Form.Control.Feedback>
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
                                        value={aluno.endereco}
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
                                    <Form.Label>Núm.*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="num"
                                        value={aluno.num}
                                        onChange={handleChange}
                                        isInvalid={!!erros.num}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {erros.num}
                                    </Form.Control.Feedback>
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
                                    <Form.Label>Celular *</Form.Label>
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
                            <Col md={3}>
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
                            <Col md={3}>
                                <Form.Group className="mb-3 text-start">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={aluno.email}
                                        onChange={handleChange}
                                        isInvalid={!!erros.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {erros.email}
                                    </Form.Control.Feedback>
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
                        <Button variant="primary" onClick={handleSubmit}>
                            Salvar
                        </Button>
                    </Form>

                    {mensagemErro && (
                        <Alert variant="danger" className="mt-3">
                            {mensagemErro}
                        </Alert>
                    )}
                </Container>
            </Modal.Body>
        </Modal>
    );
}

export default FormularioAluno;
