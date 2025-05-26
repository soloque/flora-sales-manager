
import { Sale } from "@/types";
import { SalesView } from "@/components/SalesView";
import ExampleDataBanner from "./ExampleDataBanner";

interface ExampleSalesViewProps {
  exampleSales: Sale[];
  isOwner: boolean;
  onDismiss: () => void;
  onUpdateSale?: () => void;
}

const ExampleSalesView = ({ 
  exampleSales, 
  isOwner, 
  onDismiss, 
  onUpdateSale 
}: ExampleSalesViewProps) => {
  return (
    <div className="space-y-4">
      <ExampleDataBanner onDismiss={onDismiss} />
      <SalesView 
        sales={exampleSales} 
        isOwner={isOwner} 
        onUpdateSale={onUpdateSale || (() => {})} 
      />
    </div>
  );
};

export default ExampleSalesView;
