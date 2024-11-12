import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

function FiltroAtividades({ onSelecionarAtividades, tiposAtividades }) {
    const [tiposSelecionados, setTiposSelecionados] = useState([]);

    const toggleTipo = (tipo) => {
        const novosTiposSelecionados = tiposSelecionados.includes(tipo)
            ? tiposSelecionados.filter(t => t !== tipo)
            : [...tiposSelecionados, tipo];
        setTiposSelecionados(novosTiposSelecionados);
    };

    useEffect(() => {
        onSelecionarAtividades(tiposSelecionados);
    }, [tiposSelecionados, onSelecionarAtividades]);

    return (
        <div className="p-3 rounded border border-white mt-3" style={{backgroundColor: '#e9ecef', color:"#212529"}}>
            <div className='ps-1' style={{maxHeight:'28vh', overflowY: 'auto'}}>
                {tiposAtividades.map((tipo, index) => (
                    <Form.Check
                        key={index}
                        label={tipo}
                        checked={tiposSelecionados.includes(tipo)}
                        onChange={() => toggleTipo(tipo)}
                        className='mr-3 mb-3'
                    />
                ))}
            </div>
            <button className='btn btn-outline-secondary btn-hover-gray' onClick={() => setTiposSelecionados([])}>Limpar Filtro</button>
        </div>
    );
}

export default FiltroAtividades;