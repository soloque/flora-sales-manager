
import { Sale } from "@/types";
import { format } from "date-fns";

/**
 * Format a single sale for export/sharing
 */
function formatSaleForExport(sale: Sale): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return `Vendedor: ${sale.sellerName}
Nome: ${sale.customerInfo.name}
Tel: ${sale.customerInfo.phone}
Endereço: ${sale.customerInfo.address}, ${sale.customerInfo.city}, ${sale.customerInfo.state}
Cep: ${sale.customerInfo.zipCode}
Pedido: ${sale.customerInfo.order}
Obs: ${sale.observations || sale.customerInfo.observations || 'Nenhuma observação'}
Valor: ${formatCurrency(sale.totalPrice)}

-----------------------------------`;
}

/**
 * Export selected sales to a text file
 */
export function exportSelectedSales(sales: Sale[]): void {
  if (!sales || sales.length === 0) {
    console.error("No sales to export");
    return;
  }

  // Create the content
  const header = `PEDIDOS SELECIONADOS - ${format(new Date(), 'dd/MM/yyyy HH:mm')}
Total de pedidos: ${sales.length}

===================================

`;
  
  const salesContent = sales.map(formatSaleForExport).join('\n\n');
  
  const fullContent = header + salesContent;
  
  // Create and download file
  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const filename = `pedidos-${format(new Date(), 'dd-MM-yyyy-HHmm')}.txt`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  window.URL.revokeObjectURL(url);
}

/**
 * Share selected sales using Web Share API or fallback to copy/WhatsApp
 */
export async function shareSelectedSales(sales: Sale[]): Promise<void> {
  if (!sales || sales.length === 0) {
    throw new Error("No sales to share");
  }

  // Create the content
  const header = `📋 PEDIDOS SELECIONADOS - ${format(new Date(), 'dd/MM/yyyy HH:mm')}
📊 Total de pedidos: ${sales.length}

`;
  
  const salesContent = sales.map(formatSaleForExport).join('\n\n');
  const fullContent = header + salesContent;

  // Try Web Share API first (mobile devices)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Pedidos Selecionados',
        text: fullContent,
      });
      return;
    } catch (error) {
      console.log("Web Share API failed, falling back to alternatives");
    }
  }

  // Fallback 1: Copy to clipboard
  try {
    await navigator.clipboard.writeText(fullContent);
    
    // Show options after copying
    const userChoice = confirm(
      "Conteúdo copiado para a área de transferência!\n\n" +
      "Clique OK para abrir WhatsApp Web ou Cancelar para colar em outro local."
    );
    
    if (userChoice) {
      // Open WhatsApp Web
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(fullContent)}`;
      window.open(whatsappUrl, '_blank');
    }
    
  } catch (error) {
    // Fallback 2: Manual copy using textarea
    const textArea = document.createElement('textarea');
    textArea.value = fullContent;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert("Conteúdo copiado! Cole onde desejar ou abra o WhatsApp para enviar.");
      
      // Optionally open WhatsApp
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(fullContent)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (copyError) {
      document.body.removeChild(textArea);
      throw new Error("Não foi possível copiar o conteúdo");
    }
  }
}
