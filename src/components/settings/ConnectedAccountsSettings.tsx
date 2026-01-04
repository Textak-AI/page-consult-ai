import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link2, Chrome, Linkedin, Database, ExternalLink } from "lucide-react";

interface ConnectionItem {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "coming_soon";
}

const connections: ConnectionItem[] = [
  {
    name: "Google",
    description: "Sign in with Google and sync calendar",
    icon: <Chrome className="h-5 w-5" />,
    status: "coming_soon",
  },
  {
    name: "LinkedIn",
    description: "Import profile info and share updates",
    icon: <Linkedin className="h-5 w-5" />,
    status: "coming_soon",
  },
  {
    name: "HubSpot",
    description: "Sync prospects and track engagement",
    icon: <Database className="h-5 w-5" />,
    status: "coming_soon",
  },
  {
    name: "Salesforce",
    description: "Connect leads and opportunities",
    icon: <Database className="h-5 w-5" />,
    status: "coming_soon",
  },
];

export function ConnectedAccountsSettings() {
  const getStatusBadge = (status: ConnectionItem["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>;
      case "disconnected":
        return <Badge variant="outline">Not Connected</Badge>;
      case "coming_soon":
        return <Badge variant="secondary">Coming Soon</Badge>;
    }
  };

  const getActionButton = (status: ConnectionItem["status"]) => {
    switch (status) {
      case "connected":
        return <Button variant="outline" size="sm">Disconnect</Button>;
      case "disconnected":
        return <Button size="sm">Connect</Button>;
      case "coming_soon":
        return <Button variant="outline" size="sm" disabled>Coming Soon</Button>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connected Accounts
        </CardTitle>
        <CardDescription>
          Connect third-party accounts to enhance your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connections.map((connection, index) => (
          <div key={connection.name}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {connection.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{connection.name}</span>
                    {getStatusBadge(connection.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {connection.description}
                  </p>
                </div>
              </div>
              {getActionButton(connection.status)}
            </div>
            {index < connections.length - 1 && <Separator />}
          </div>
        ))}

        <div className="pt-4">
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            View all integrations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
