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
    const [eventos, setEventos] = useState([]);
    const [eventosFiltrados, setEventosFiltrados] = useState([]);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);
    const [tiposAtividades, setTiposAtividades] = useState([]);

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/consulta/allconsultas');
                const data = await response.json();

                const eventosFormatados = data.map((consultas) => ({
                    id: consultas.id,
                    title: consultas.title,
                    start: new Date(consultas.start),
                    end: new Date(consultas.end),
                    desc: consultas.desc,
                    color: consultas.color,
                    tipo: consultas.tipo
                }));

                setEventos(eventosFormatados);
                setEventosFiltrados(eventosFormatados);

                const tiposUnicos = [...new Set(eventosFormatados.map(evento => evento.tipo))].filter(tipo => tipo !== '');
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
        const novoId = eventos.length > 0 ? Math.max(...eventos.map(e => e.id)) + 1 : 1;
        const eventoComId = { ...novoEvento, id: novoId };

        const eventosAtualizados = [...eventos, eventoComId];
        setEventos(eventosAtualizados);
        setEventosFiltrados(eventosAtualizados);

        const tiposAtualizados = [...new Set(eventosAtualizados.map(evento => evento.tipo))].filter(tipo => tipo !== '');
        setTiposAtividades(tiposAtualizados);
    };

    const handleSelecionarAtividades = useCallback((atividadesSelecionadas) => {
        if (atividadesSelecionadas.length === 0) {
            setEventosFiltrados(eventos);
        } else {
            setEventosFiltrados(eventos.filter(evento => atividadesSelecionadas.includes(evento.tipo)));
        }
    }, [eventos]);

    return (
        <div className='tela'>
            <div className='toolbar p-4' style={{ overflowY: 'auto' }}>
                <Adicionar onAdicionar={handleAdicionar} />
                <FiltroAtividades
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
                    onDelete={(eventId) => {
                        const updatedEvents = eventos.filter((event) => event.id !== eventId);
                        setEventos(updatedEvents);
                        setEventosFiltrados(updatedEvents);
                        setEventoSelecionado(null);
                    }}
                    onUpdate={(updatedEvent) => {
                        const updatedEvents = eventos.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
                        setEventos(updatedEvents);
                        setEventosFiltrados(updatedEvents);
                        setEventoSelecionado(null);
                    }}
                />
            )}
        </div>
    );
}

export default Calendario;
