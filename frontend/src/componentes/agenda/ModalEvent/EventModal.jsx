import React, { useState } from 'react';
import { Modal, Button, Form, Collapse, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EventModal = ({ evento, onClose, onDelete, onUpdate }) => {
    const [editedEvent, setEditedEvent] = useState({ ...evento });
    const [collapsed, setCollapsed] = useState(true);
    const [mensagemErro, setMensagemErro] = useState('');
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
                    title: editedEvent.title,
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

    const adjustDate = (date) => {
        const adjustedDate = new Date(date);
        adjustedDate.setHours(adjustedDate.getHours() - 3);
        return adjustedDate.toISOString().slice(0, -8);
    };

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header>
                <Modal.Title>{editedEvent.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formTitle">
                        <Form.Label>Título</Form.Label>
                        <Form.Control type="text" name="title" value={editedEvent.title} onChange={handleInputChange} />
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
                <Button variant="danger" onClick={handleDelete}>
                    Apagar
                </Button>
                <Button variant="primary" onClick={handleUpdate}>
                    Salvar Alterações
                </Button>
            </Modal.Footer>
            {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
        </Modal>
    );
};

export default EventModal;
