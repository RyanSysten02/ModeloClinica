import Calendario from "../componentes/Calendario";
import TelaListaAlunos from "../componentes/aluno/telalisaluno";
import Pagina from "./PagPadrao";


const Layoutaluno = () => {
  return (
    <Pagina>
      <TelaListaAlunos></TelaListaAlunos>
    </Pagina>
  );
};

export default Layoutaluno;