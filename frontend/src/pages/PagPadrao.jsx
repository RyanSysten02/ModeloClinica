import Cabecalho from "../componentes/Cabecalho";
import Sidebar from "./sidbar2";

export default function Pagina(props) {
    return (
        <div>
            <Cabecalho />
            <div className="layout">
               <Sidebar/>
                <main >
                    {props.children}
                </main>
            </div>
        </div>
    );
}