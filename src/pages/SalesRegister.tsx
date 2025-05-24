
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewSale from "./NewSale";

const SalesRegister = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Este componente é apenas um wrapper para redirecionar para a página de Nova Venda
    // Isso permite que tenhamos rotas consistentes (/sales/new)
  }, []);

  return (
    <NewSale />
  );
};

export default SalesRegister;
