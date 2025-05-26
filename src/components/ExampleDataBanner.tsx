
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, X, Clock, Sparkles } from "lucide-react";

interface ExampleDataBannerProps {
  onDismiss: () => void;
}

const ExampleDataBanner = ({ onDismiss }: ExampleDataBannerProps) => {
  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Bem-vindo ao SalesCanvas! 
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Esta página está preenchida com <strong>dados de exemplo</strong> para você ver como fica quando tem vendas e vendedores cadastrados. 
                Comece criando sua primeira venda ou adicionando vendedores à sua equipe!
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span>Os exemplos se apagam automaticamente em 45 segundos</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onDismiss}
                  className="h-7 px-3 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Entendi, esconder
                </Button>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="text-blue-600 hover:bg-blue-100 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExampleDataBanner;
