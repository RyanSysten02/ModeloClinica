import React, { useState } from 'react';
import { Modal, Button, Form, Collapse, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ListaPacientesModal from '../../paciente/ListaPacientes';
import ListaFuncionariosModal from '../../funcionario/ListaFuncionarios';

const EventModal = ({ evento, onClose, onDelete, onUpdate }) => {
    const [editedEvent, setEditedEvent] = useState({ ...evento });
    const [collapsed, setCollapsed] = useState(true);
    const [mensagemErro, setMensagemErro] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [motivoCancelamento, setMotivoCancelamento] = useState('');
    const [motivoErro, setMotivoErro] = useState('');
    const [showAdiamentoModal, setShowAdiamentoModal] = useState(false);
    const [novaDataInicio, setNovaDataInicio] = useState('');
    const [novaDataFim, setNovaDataFim] = useState('');
    const [motivoAdiamento, setMotivoAdiamento] = useState('');
    const [erroAdiamento, setErroAdiamento] = useState('');
    const [showListaPacientesModal, setShowListaPacientesModal] = useState(false);
    const [showListaFuncionariosModal, setShowListaFuncionariosModal] = useState(false);
    const [listaPacientes, setListaPacientes] = useState([]);
    const [listaFuncionarios, setListaFuncionarios] = useState([]);
    
    const [novoEvento, setNovoEvento] = useState({
        id_paciente: evento?.id_paciente || '',
        pacienteNome: evento?.paciente_nome || '',
        id_func_responsavel: evento?.id_func_responsavel || '',
        funcionarioNome: evento?.funcionario_nome || '',
        // outros campos, se necessário
    });
    

    const handleSelectPaciente = (paciente) => {
        setNovoEvento({
            ...novoEvento,
            id_paciente: paciente.id,
            pacienteNome: paciente.nome, // Para exibição
        });
        setShowListaPacientesModal(false);
    };
    const handleSelectFuncionario = (funcionario) => {
        setNovoEvento({
            ...novoEvento,
            id_func_responsavel: funcionario.id,
            funcionarioNome: funcionario.nome, // Para exibição
        });
        setShowListaFuncionariosModal(false);
    };

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedEvent({ ...editedEvent, [name]: value });
    };

    const handleColorChange = (e) => {
        setEditedEvent({ ...editedEvent, color: e.target.value });
    };

    const handleStartDateChange = (e) => {
        const startDate = new Date(e.target.value);
        if (startDate <= editedEvent.end) {
            setEditedEvent({ ...editedEvent, start: startDate });
        }
    };

    const handleEndDateChange = (e) => {
        const endDate = new Date(e.target.value);
        if (endDate >= editedEvent.start) {
            setEditedEvent({ ...editedEvent, end: endDate });
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        setMensagemErro('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMensagemErro('Token de autenticação não encontrado. Faça login novamente.');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5001/api/consulta/consultas/${evento.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                onDelete(evento.id);
                navigate('/paginicial');
            } else {
                const data = await response.json();
                setMensagemErro(data.message || 'Erro ao deletar evento.');
            }
        } catch (error) {
            setMensagemErro('Ocorreu um erro ao tentar deletar o evento.');
        }
    };

    const formatDateForMySQL = (isoDate) => {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMensagemErro('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMensagemErro('Token de autenticação não encontrado. Faça login novamente.');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5001/api/consulta/consultas/${editedEvent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id_paciente: editedEvent.id_paciente,
                    start: formatDateForMySQL(editedEvent.start),
                    end: formatDateForMySQL(editedEvent.end),
                    desc: editedEvent.desc,
                    color: editedEvent.color,
                    tipo: editedEvent.tipo
                }),
            });

            if (response.ok) {
                onUpdate(editedEvent);
                onClose();
            } else {
                const data = await response.json();
                setMensagemErro(data.message || 'Erro ao atualizar evento.');
            }
        } catch (error) {
            setMensagemErro('Ocorreu um erro ao tentar atualizar o evento.');
        }
    };

    const handleOpenCancelModal = () => {
        setShowCancelModal(true); // Apenas exibe o modal de cancelamento
    };

    const handleCancelamento = async () => {
        console.log('Iniciando o processo de cancelamento...');
        if (motivoCancelamento.length < 15) {
            setMotivoErro('O motivo deve ter pelo menos 15 caracteres.');
            console.log('Erro: Motivo muito curto.');
            return;
        }
    
        setMensagemErro('');
        setMotivoErro('');
    
        try {
            console.log('Enviando requisição para cancelar consulta...');
            const token = localStorage.getItem('token');
            if (!token) {
                setMensagemErro('Token de autenticação não encontrado. Faça login novamente.');
                console.log('Erro: Token não encontrado.');
                navigate('/login');
                return;
            }
    
            const response = await fetch(`http://localhost:5001/api/consulta/consultacancelamento/${evento.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ motivocancelamento: motivoCancelamento }),
            });
    
            console.log('Resposta da API:', response);
            if (response.ok) {
                const updatedEvent = { ...editedEvent, status: 'C', motivoCancelamento };
                onUpdate(updatedEvent);
                onDelete(evento.id);
                setShowCancelModal(false);
                onClose();
                console.log('Consulta cancelada com sucesso!');
            } else {
                const data = await response.json();
                setMensagemErro(data.message || 'Erro ao cancelar a consulta.');
                console.log('Erro recebido da API:', data);
            }
        } catch (error) {
            setMensagemErro('Ocorreu um erro ao tentar cancelar a consulta.');
            console.error('Erro inesperado:', error);
        }
    };
    
    const handleAdiamento = async () => {
        if (!motivoAdiamento || motivoAdiamento.length < 15) {
            setErroAdiamento('O motivo deve ter pelo menos 15 caracteres.');
            return;
        }
    
        if (!novaDataInicio || !novaDataFim) {
            setErroAdiamento('As datas de início e fim devem ser preenchidas.');
            return;
        }
    
        setMensagemErro('');
        setErroAdiamento('');
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMensagemErro('Token de autenticação não encontrado. Faça login novamente.');
                navigate('/login');
                return;
            }
    
            const response = await fetch(`http://localhost:5001/api/consulta/adiar/${evento.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    start: novaDataInicio,
                    end: novaDataFim,
                    motivo_adiamento: motivoAdiamento,
                }),
            });
    
            if (response.ok) {
                const updatedEvent = {
                    ...editedEvent,
                    start: novaDataInicio,
                    end: novaDataFim,
                    motivo_adiamento: motivoAdiamento,
                };
                onUpdate(updatedEvent);
                setShowAdiamentoModal(false);
                onClose();
            } else {
                const data = await response.json();
                setMensagemErro(data.message || 'Erro ao adiar a consulta.');
            }
        } catch (error) {
            setMensagemErro('Ocorreu um erro ao tentar adiar a consulta.');
        }
    };

    const adjustDate = (date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setHours(adjustedDate.getHours() - 3);
        return adjustedDate.toISOString().slice(0, -8);
    };

    return (
        <>
            <Modal show={true} onHide={onClose}>
                <Modal.Header>
                <Modal.Title>
            {editedEvent.title} - Paciente: {evento.paciente_nome}
        </Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
        <Form.Group controlId="formBasicPaciente" className="mb-3">
    <Form.Label>Paciente</Form.Label>
    <div className="d-flex align-items-center">
        <Form.Control
            type="text"
            placeholder="Selecione um paciente"
            name="pacienteNome"
            value={novoEvento.pacienteNome || ''} // Exibe o nome do paciente
            readOnly // Campo somente leitura
            style={{ flex: 1, backgroundColor: '#e9ecef' }} // Indica que está desabilitado
        />
        <Button
            variant="secondary"
            onClick={() => setShowListaPacientesModal(true)} // Abre o modal de pacientes
            className="ms-2"
        >
            <i className="bi bi-search"></i>
        </Button>
    </div>
</Form.Group>

<Form.Group controlId="formBasicFuncionario" className="mb-3">
    <Form.Label>Funcionário Responsável</Form.Label>
    <div className="d-flex align-items-center">
        <Form.Control
            type="text"
            placeholder="Selecione o funcionário responsável"
            name="funcionarioNome"
            value={novoEvento.funcionarioNome || ''} // Exibe o nome do funcionário
            readOnly // Campo somente leitura
            style={{ flex: 1, backgroundColor: '#e9ecef' }} // Indica que está desabilitado
        />
        <Button
            variant="secondary"
            onClick={() => setShowListaFuncionariosModal(true)} // Abre o modal de funcionários
            className="ms-2"
        >
            <i className="bi bi-search"></i>
        </Button>
    </div>
</Form.Group>

                        <Form.Group controlId="formDesc">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control as="textarea" rows={3} name="desc" value={editedEvent.desc} onChange={handleInputChange} />
                        </Form.Group>
    
                        <Collapse in={!collapsed}>
                            <div>
                                <Form.Group controlId="formInicio">
                                    <Form.Label>Início</Form.Label>
                                    <Form.Control type="datetime-local" name="start" value={adjustDate(editedEvent.start)} onChange={handleStartDateChange} />
                                </Form.Group>
    
                                <Form.Group controlId="formEnd">
                                    <Form.Label>Fim</Form.Label>
                                    <Form.Control type="datetime-local" name="end" value={adjustDate(editedEvent.end)} onChange={handleEndDateChange} />
                                </Form.Group>
    
                                <Form.Group controlId="formColor">
                                    <Form.Label>Cor</Form.Label>
                                    <Form.Control type="color" name="color" value={editedEvent.color} onChange={handleColorChange} />
                                </Form.Group>
    
                                <Form.Group controlId="formTipo">
                                    <Form.Label>Tipo</Form.Label>
                                    <Form.Control type="text" name="tipo" value={editedEvent.tipo} onChange={handleInputChange} />
                                </Form.Group>
                            </div>
                        </Collapse>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={() => setCollapsed(!collapsed)}>
                        {!collapsed ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
                    </Button>
                    {/*<Button variant="danger" onClick={handleDelete}>
                        Apagar
                    </Button> Tiramos o botão de apagar, pois achamos melhor não ter essa opção*/}
                    <Button variant="primary" onClick={handleUpdate}>
                        Salvar Alterações
                    </Button>
                    <Button variant="warning" onClick={handleOpenCancelModal}>
                        Cancelar Consulta
                    </Button>
                    <Button variant="info" onClick={() => setShowAdiamentoModal(true)}>
                        Adiar Consulta
                    </Button>
                </Modal.Footer>
                {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
                <ListaPacientesModal show={showListaPacientesModal} onHide={() => setShowListaPacientesModal(false)} onSelectPaciente={handleSelectPaciente} />
                <ListaFuncionariosModal show={showListaFuncionariosModal} onHide={() => setShowListaFuncionariosModal(false)} onSelectFuncionario={handleSelectFuncionario} />
            </Modal>
    
            {/* Modal de Cancelamento */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Motivo do Cancelamento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formMotivoCancelamento">
                            <Form.Label>Descreva o motivo do cancelamento:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="motivocancelamento"
                                value={motivoCancelamento}
                                onChange={(e) => setMotivoCancelamento(e.target.value)}
                                isInvalid={!!motivoErro}
                            />
                            <Form.Control.Feedback type="invalid">{motivoErro}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Voltar
                    </Button>
                    <Button variant="danger" onClick={handleCancelamento}>
                        Confirmar Cancelamento
                    </Button>
                </Modal.Footer>
            </Modal>
    
            {/* Modal de Adiamento */}
            <Modal show={showAdiamentoModal} onHide={() => setShowAdiamentoModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Adiamento da Consulta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formNovaDataInicio">
                            <Form.Label>Nova Data de Início:</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={novaDataInicio}
                                onChange={(e) => setNovaDataInicio(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formNovaDataFim">
                            <Form.Label>Nova Data de Fim:</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={novaDataFim}
                                onChange={(e) => setNovaDataFim(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMotivoAdiamento">
                            <Form.Label>Motivo do Adiamento:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={motivoAdiamento}
                                onChange={(e) => setMotivoAdiamento(e.target.value)}
                                isInvalid={!!erroAdiamento}
                            />
                            <Form.Control.Feedback type="invalid">{erroAdiamento}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAdiamentoModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleAdiamento}>
                        Confirmar Adiamento
                    </Button>
                </Modal.Footer>
                
            </Modal>
        </>
    );
    
};

export default EventModal;
