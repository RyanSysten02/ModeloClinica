import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br'; // Importa o locale em português
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './agenda/Calendario.css';
import EventModal from './agenda/ModalEvent/EventModal.jsx';
import CustomTollbar from './agenda/CustomCalendar/CustomTollbar.jsx';


moment.locale('pt-br'); // Define o idioma do Moment para português
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

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

    const moverEventos = async (data) => {
        const { start, end } = data;
        const eventToUpdate = eventos.find((event) => event.id === data.event.id);
    
        if (eventToUpdate) {
            const updatedEvent = {
                ...eventToUpdate,
                start: new Date(start),
                end: new Date(end),
            };
    
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Token de autenticação não encontrado.');
                    return;
                }
    
                const response = await fetch(`http://localhost:5001/api/consulta/consultas/${updatedEvent.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: updatedEvent.title,
                        start: moment(updatedEvent.start).format("YYYY-MM-DD HH:mm:ss"),
                        end: moment(updatedEvent.end).format("YYYY-MM-DD HH:mm:ss"),
                        desc: updatedEvent.desc,
                        color: updatedEvent.color,
                        tipo: updatedEvent.tipo,
                    }),
                });
    
                if (response.ok) {
                    const updatedEvents = eventos.map((event) =>
                        event.id === updatedEvent.id ? updatedEvent : event
                    );
                    setEventos(updatedEvents);
                    setEventosFiltrados(updatedEvents);
                } else {
                    console.error('Erro ao atualizar o evento:', await response.json());
                }
            } catch (error) {
                console.error('Erro ao tentar mover o evento:', error);
            }
        }
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
        <div className='tela' >
         
            <div className='tela'>
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
                    className='tela'
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
