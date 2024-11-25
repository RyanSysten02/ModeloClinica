import Cabecalho from "../componentes/Cabecalho";
import Sidebar from "./sidbar2";

export default function Pagina(props) {
    return (
        <div>
            <Cabecalho />
            <div className="d-flex bd-highlight">
               <Sidebar className="p-2 flex-shrink-1 bd-highlight"/>
                <main className="p-2 w-100 bd-highlight" >
                    {props.children}
                </main>
            </div>
        </div>
    );
}