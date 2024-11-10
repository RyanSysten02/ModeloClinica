import Cabecalho from "../componentes/Cabecalho";



export default function Pagina(props) {
    return (
        <div>
            <Cabecalho/>
            <div className="container">
                {props.children}
            </div>
        </div>
    )
}