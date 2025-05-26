
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";

const formSchema = z.object({
  reason: z.string().min(1, "Selecione um motivo"),
  description: z.string().min(10, "Descreva o problema com pelo menos 10 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SupportContactFormProps {
  children: React.ReactNode;
}

const SupportContactForm = ({ children }: SupportContactFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      description: "",
      email: "",
      phone: "",
    },
  });

  const reasons = [
    "Problemas com pagamento",
    "Erro no sistema",
    "Dúvidas sobre funcionalidades",
    "Problemas com planos",
    "Sugestões de melhorias",
    "Cancelamento de conta",
    "Outros",
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Create email body
      const emailBody = `
        NOVO CONTATO DE SUPORTE - SalesCanvas
        
        Motivo: ${data.reason}
        
        Descrição do Problema:
        ${data.description}
        
        Informações de Contato:
        Email: ${data.email}
        ${data.phone ? `Telefone/WhatsApp: ${data.phone}` : ''}
        
        Data: ${new Date().toLocaleString('pt-BR')}
      `;

      // Create mailto link
      const subject = encodeURIComponent(`[SalesCanvas] ${data.reason}`);
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:dealerempresarial@gmail.com?subject=${subject}&body=${body}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Show success message
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato o mais breve possível.",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsOpen(false);
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou envie um email diretamente para dealerempresarial@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Falar com Suporte
          </DialogTitle>
          <DialogDescription>
            Descreva seu problema e entraremos em contato o mais breve possível.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo do contato</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do problema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente o problema que está enfrentando..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email para contato</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone/WhatsApp (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportContactForm;
