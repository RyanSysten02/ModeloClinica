import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./agenda/Calendario.css";
import EventModal from "./agenda/ModalEvent/EventModal.jsx";
import CustomTollbar from "./agenda/CustomCalendar/CustomTollbar.jsx";

moment.locale("pt-br");
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
        const response = await fetch("http://localhost:5001/api/aulas/listar");
        const data = await response.json();

        const eventosFormatados = data.map((aula) => ({
          id: aula.id,
          id_turma: aula.id_turma,
          turma_nome: aula.turma_nome,
          id_func_responsavel: aula.id_func_responsavel,
          professor_nome: aula.professor_nome,
          start: new Date(aula.start),
          end: new Date(aula.end),
          desc: aula.desc,
          color: aula.color,
          tipo: aula.tipo,
          title: `${aula.turma_nome} - ${aula.tipo}`,
        }));

        setEventos(eventosFormatados);
        setEventosFiltrados(eventosFormatados);

        const tiposUnicos = [
          ...new Set(eventosFormatados.map((evento) => evento.tipo)),
        ].filter((tipo) => tipo !== "");
        setTiposAtividades(tiposUnicos);
      } catch (error) {
        console.error("Erro ao buscar aulas agendadas:", error);
      }
    };

    fetchEventos();
  }, []);

  const eventStyle = (event) => ({
    style: {
      backgroundColor: event.color || "#3174ad",
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
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token de autenticação não encontrado.");
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/aulas/atualizar/${updatedEvent.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_turma: updatedEvent.id_turma,
              id_func_responsavel: updatedEvent.id_func_responsavel,
              start: moment(updatedEvent.start).format("YYYY-MM-DD HH:mm:ss"),
              end: moment(updatedEvent.end).format("YYYY-MM-DD HH:mm:ss"),
              desc: updatedEvent.desc,
              color: updatedEvent.color,
              tipo: updatedEvent.tipo,
            }),
          }
        );

        if (response.ok) {
          const updatedEvents = eventos.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          );
          setEventos(updatedEvents);
          setEventosFiltrados(updatedEvents);
        } else {
          console.error("Erro ao atualizar a aula:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao tentar mover a aula:", error);
      }
    }
  };

  const handleEventClick = (evento) => {
    setEventoSelecionado(evento);
  };

  const handleEventClose = () => {
    setEventoSelecionado(null);
  };

  return (
    <div className="tela">
      <DragAndDropCalendar
        defaultDate={moment().toDate()}
        defaultView="month"
        events={eventosFiltrados}
        localizer={localizer}
        resizable
        onEventDrop={moverEventos}
        onEventResize={moverEventos}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyle}
        components={{ toolbar: CustomTollbar }}
        className="tela"
      />

      {eventoSelecionado && (
        <EventModal
          evento={eventoSelecionado}
          onClose={handleEventClose}
          onDelete={(eventId) => {
            const updatedEvents = eventos.filter(
              (event) => event.id !== eventId
            );
            setEventos(updatedEvents);
            setEventosFiltrados(updatedEvents);
            setEventoSelecionado(null);
          }}
          onUpdate={(updatedEvent) => {
            const updatedEvents = eventos.map((event) =>
              event.id === updatedEvent.id ? updatedEvent : event
            );
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
