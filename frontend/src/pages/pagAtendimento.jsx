import Calendario from "../componentes/Calendario";
import TelaAtendimentos from "../componentes/Atendimento/telaAtendimento";
import Pagina from "./PagPadrao";


const LayoutAtendimento = () => {
  return (
    <Pagina>
      <TelaAtendimentos></TelaAtendimentos>
    </Pagina>
  );
};

export default LayoutAtendimento;