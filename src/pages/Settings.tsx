import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, User, Mail, Bell, CreditCard, Shield, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { EmailSignatureSettings } from "@/components/settings/EmailSignatureSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { ConnectedAccountsSettings } from "@/components/settings/ConnectedAccountsSettings";

type SettingsSection = "profile" | "signature" | "notifications" | "billing" | "security" | "connected";

const sections = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "signature" as const, label: "Email Signature", icon: Mail },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
  { id: "security" as const, label: "Security", icon: Shield },
  { id: "connected" as const, label: "Connected Accounts", icon: Link2 },
];

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "signature":
        return <EmailSignatureSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "billing":
        return <BillingSettings />;
      case "security":
        return <SecuritySettings />;
      case "connected":
        return <ConnectedAccountsSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 bg-card border border-border rounded-lg p-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  className={cn(
                    "justify-start gap-3 whitespace-nowrap w-full",
                    activeSection === section.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </Button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-card border border-border rounded-lg p-6">
              <ScrollArea className="h-full">
                {renderContent()}
              </ScrollArea>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
