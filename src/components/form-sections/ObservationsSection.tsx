
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ObservationsSectionProps {
  formData: {
    observations: string;
  };
  handleInputChange: (field: string, value: any) => void;
}

export function ObservationsSection({ formData, handleInputChange }: ObservationsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Observações</h3>
      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => handleInputChange('observations', e.target.value)}
          placeholder="Observações adicionais sobre a venda"
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
