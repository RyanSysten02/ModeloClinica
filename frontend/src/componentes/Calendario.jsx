import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './agenda/Calendario.css';

import EventModal from './agenda/ModalEvent/EventModal.jsx';
import Adicionar from './agenda/adicionar/Adicionar.jsx';
import CustomTollbar from './agenda/CustomCalendar/CustomTollbar.jsx';
import FiltroAtividades from './agenda/filtro/FiltroAtividades.jsx';

const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

function Calendario() {
    const [eventos, setEventos] = useState([]); // Eventos completos
    const [eventosFiltrados, setEventosFiltrados] = useState([]); // Eventos filtrados
    const [eventoSelecionado, setEventoSelecionado] = useState(null);
    const [tiposAtividades, setTiposAtividades] = useState([]); // Tipos de atividades

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/consulta/allconsultas');
                const data = await response.json();

                // Formata os dados para o calendário
                const eventosFormatados = data.map((consultas) => ({
                    id: consultas.id,
                    title: consultas.title,
                    start: new Date(consultas.start),
                    end: new Date(consultas.end),
                    desc: consultas.desc,
                    color: consultas.color,
                    tipo: consultas.tipo
                }));

                // Extrair tipos únicos de atividades
                const tiposUnicos = [...new Set(eventosFormatados.map(evento => evento.tipo))].filter(tipo => tipo !== '');

                // Atualizar os estados
                setEventos(eventosFormatados);
                setEventosFiltrados(eventosFormatados);
                setTiposAtividades(tiposUnicos);
            } catch (error) {
                console.error("Erro ao buscar eventos:", error);
            }
        };

        fetchEventos();
    }, []);

    const eventStyle = (event) => ({
        style: {
            backgroundColor: event.color || '#3174ad',
        },
    });

    const moverEventos = (data) => {
        const { start, end } = data;
        const updatedEvents = eventos.map((event) => {
            if (event.id === data.event.id) {
                return {
                    ...event,
                    start: new Date(start),
                    end: new Date(end),
                };
            }
            return event;
        });
        setEventos(updatedEvents);
    };

    const handleEventClick = (evento) => {
        setEventoSelecionado(evento);
    };

    const handleEventClose = () => {
        setEventoSelecionado(null);
    };

    const handleAdicionar = (novoEvento) => {
        // Lógica para adicionar novo evento
        setEventos([...eventos, { ...novoEvento, id: eventos.length + 1 }]);
    };

    const handleEventDelete = (eventId) => {
        const updatedEvents = eventos.filter((event) => event.id !== eventId);
        setEventos(updatedEvents);
        setEventoSelecionado(null);
    };

    const handleEventUpdate = (updatedEvent) => {
        const updatedEvents = eventos.map((event) => {
            if (event.id === updatedEvent.id) {
                return updatedEvent;
            }
            return event;
        });
        setEventos(updatedEvents);
        setEventoSelecionado(null);
    };

    const handleSelecionarAtividades = useCallback((atividadesSelecionadas) => {
        setEventosFiltrados(atividadesSelecionadas);
    }, []);
    

    return (
        <div className='tela'>
            <div className='toolbar p-4' style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                <Adicionar onAdicionar={handleAdicionar} />
                {/* Passar tipos de atividades para o FiltroAtividades */}
                <FiltroAtividades
                    atividades={eventos}
                    tiposAtividades={tiposAtividades}
                    onSelecionarAtividades={handleSelecionarAtividades}
                />
            </div>

            <div className='calendario'>
                <DragAndDropCalendar
                    defaultDate={moment().toDate()}
                    defaultView='month'
                    events={eventosFiltrados}
                    localizer={localizer}
                    resizable
                    onEventDrop={moverEventos}
                    onEventResize={moverEventos}
                    onSelectEvent={handleEventClick}
                    eventPropGetter={eventStyle}
                    components={{
                        toolbar: CustomTollbar,
                    }}
                    className='calendar'
                />
            </div>
            {eventoSelecionado && (
                <EventModal
                    evento={eventoSelecionado}
                    onClose={handleEventClose}
                    onDelete={handleEventDelete}
                    onUpdate={handleEventUpdate}
                />
            )}
        </div>
    );
}

export default Calendario;
