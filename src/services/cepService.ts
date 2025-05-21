
import { Address } from "@/types";

const fetchAddressByCep = async (cep: string): Promise<Address> => {
  // Remove any non-digit characters
  const cleanedCep = cep.replace(/\D/g, '');
  
  // Validate CEP format (8 digits)
  if (cleanedCep.length !== 8) {
    throw new Error("CEP inválido. O CEP deve conter 8 dígitos.");
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    
    if (!response.ok) {
      throw new Error("Erro ao buscar o CEP. Tente novamente mais tarde.");
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao buscar o CEP. Verifique sua conexão.");
  }
};

export { fetchAddressByCep };
