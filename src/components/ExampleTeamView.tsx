
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MessageSquare, TrendingUp } from "lucide-react";
import ExampleDataBanner from "./ExampleDataBanner";
import { format } from "date-fns";

interface ExampleTeamViewProps {
  teamMembers: User[];
  onDismiss: () => void;
}

const ExampleTeamView = ({ teamMembers, onDismiss }: ExampleTeamViewProps) => {
  return (
    <div className="space-y-6">
      <ExampleDataBanner onDismiss={onDismiss} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sua Equipe de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Membro desde {format(member.createdAt, "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="secondary">
                        {member.role === 'seller' ? 'Vendedor' : 'Proprietário'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                        <Button size="sm" variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Performance
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExampleTeamView;
