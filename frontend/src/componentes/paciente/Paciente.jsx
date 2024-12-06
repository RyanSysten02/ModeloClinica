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

function FormularioPaciente({ show, onHide, onPacientesAtualizados }) {
    const [paciente, setPaciente] = useState({
        nome: "",
        cpf: "",
        rg: "",
        dataNascimento: "",
        sexo: "",
        numeroBeneficio: "",
        planoSaude: "",
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

        setPaciente({ ...paciente, [name]: novoValor });

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
        const dadosPaciente = {
            ...paciente,
            cpf: removerMascara(paciente.cpf),
            celular: removerMascara(paciente.celular),
            telefone: removerMascara(paciente.telefone),
        };

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMensagemErro("Token de autenticação não encontrado. Faça login novamente.");
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:5001/api/paciente/cadastrapaciente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dadosPaciente),
            });

            const data = await response.json();

            if (response.ok) {
                setPaciente({
                    nome: "",
                    cpf: "",
                    rg: "",
                    dataNascimento: "",
                    sexo: "",
                    numeroBeneficio: "",
                    planoSaude: "",
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
                onPacientesAtualizados();

                
            } else {
                setMensagemErro(data.message || "Falha ao adicionar paciente.");
            }
        } catch (error) {
            setMensagemErro("Ocorreu um erro. Tente novamente.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Formulário de Paciente</Modal.Title>
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
                                    <Form.Label>Dt Nascimento</Form.Label>
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
                                        value={paciente.telefone}
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
                                        value={paciente.contatoEmergencia}
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
                                        value={paciente.observacoes}
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

export default FormularioPaciente;
