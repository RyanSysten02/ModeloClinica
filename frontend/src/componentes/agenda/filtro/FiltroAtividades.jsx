import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

function FiltroAtividades({ onSelecionarAtividades }) {
    const [tiposAtividades, setTiposAtividades] = useState([]);
    const [tiposSelecionados, setTiposSelecionados] = useState([]);

    const toggleTipo = (tipo) => {
        if (tiposSelecionados.includes(tipo)) {
            setTiposSelecionados(tiposSelecionados.filter(t => t !== tipo));
        } else {
            setTiposSelecionados([...tiposSelecionados, tipo]);
        }
    };

    const fetchTiposAtividades = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/consulta/tipo');
            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }
            
            const data = await response.json();
            if (Array.isArray(data)) {
                setTiposAtividades(data);
            } else {
                console.error("Erro: a resposta não é um array.");
            }
        } catch (error) {
            console.error("Erro ao buscar tipos de atividades:", error);
        }
    };
    
    useEffect(() => {
        fetchTiposAtividades();
    }, []);

    useEffect(() => {
        if (tiposSelecionados.length === 0) {
            onSelecionarAtividades([]); 
        } else {
            onSelecionarAtividades(tiposSelecionados);
        }
    }, [tiposSelecionados, onSelecionarAtividades]);

    return (
        <div className="p-3 rounded border border-white mt-3" style={{backgroundColor: '#e9ecef', color:"#212529"}}>
            <div className='ps-1' style={{maxHeight:'28vh', overflowY: 'auto'}}>
                {tiposAtividades.map((tipo, index) => (
                    <Form.Check
                        key={index}
                        label={tipo.tipo}
                        checked={tiposSelecionados.includes(tipo.tipo)}
                        onChange={() => toggleTipo(tipo.tipo)}
                        className='mr-3 mb-3'
                    />
                ))}
            </div>
            <button className='btn btn-outline-secondary btn-hover-gray' onClick={()=> setTiposSelecionados([])}>Limpar Filtro</button>
        </div>
    );
    
}

export default FiltroAtividades;
