import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Phone, Globe, User, Briefcase, Loader2, Image, Code } from "lucide-react";

interface SignatureData {
  signature_name: string;
  signature_title: string;
  signature_email: string;
  signature_phone: string;
  signature_website: string;
  signature_headshot_url: string;
  signature_enabled: boolean;
  signature_type: "simple" | "html";
  signature_html: string;
}

export function EmailSignatureSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signature, setSignature] = useState<SignatureData>({
    signature_name: "",
    signature_title: "",
    signature_email: "",
    signature_phone: "",
    signature_website: "",
    signature_headshot_url: "",
    signature_enabled: true,
    signature_type: "simple",
    signature_html: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("signature_name, signature_title, signature_email, signature_phone, signature_website, signature_headshot_url, signature_enabled, signature_type, signature_html")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setSignature({
          signature_name: data.signature_name || "",
          signature_title: data.signature_title || "",
          signature_email: data.signature_email || user.email || "",
          signature_phone: data.signature_phone || "",
          signature_website: data.signature_website || "",
          signature_headshot_url: data.signature_headshot_url || "",
          signature_enabled: data.signature_enabled ?? true,
          signature_type: (data.signature_type as "simple" | "html") || "simple",
          signature_html: data.signature_html || "",
        });
      } else {
        setSignature(prev => ({
          ...prev,
          signature_email: user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...signature,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Email signature saved!");
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Failed to save signature");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SignatureData, value: string | boolean) => {
    setSignature(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (tab: string) => {
    updateField("signature_type", tab as "simple" | "html");
  };

  const renderSimplePreview = () => {
    if (!signature.signature_enabled) {
      return <span className="text-muted-foreground italic">Signature disabled</span>;
    }

    return (
      <div className="flex items-start gap-4">
        {signature.signature_headshot_url && (
          <img 
            src={signature.signature_headshot_url} 
            alt="Headshot" 
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="whitespace-pre-line">
          Best regards,
          {"\n\n"}
          <strong>{signature.signature_name || "[Your Name]"}</strong>
          {signature.signature_title && `\n${signature.signature_title}`}
          {signature.signature_email && `\n${signature.signature_email}`}
          {signature.signature_phone && `\n${signature.signature_phone}`}
          {signature.signature_website && `\n${signature.signature_website}`}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Signature
        </CardTitle>
        <CardDescription>
          Customize the signature that appears at the end of your Quick Pivot emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="signature-enabled">Include signature in emails</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, your signature will be added to prospect emails
            </p>
          </div>
          <Switch
            id="signature-enabled"
            checked={signature.signature_enabled}
            onCheckedChange={(checked) => updateField("signature_enabled", checked)}
          />
        </div>

        <Separator />

        <Tabs value={signature.signature_type} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple" className="gap-2">
              <User className="h-4 w-4" />
              Simple
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-2">
              <Code className="h-4 w-4" />
              Custom HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4 mt-4">
            {/* Form Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="signature-name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                <Input
                  id="signature-name"
                  placeholder="Kyle Moyer"
                  value={signature.signature_name}
                  onChange={(e) => updateField("signature_name", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signature-title" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Title
                </Label>
                <Input
                  id="signature-title"
                  placeholder="Founder, PageConsult AI"
                  value={signature.signature_title}
                  onChange={(e) => updateField("signature_title", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signature-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="signature-email"
                  type="email"
                  placeholder="kyle@pageconsult.ai"
                  value={signature.signature_email}
                  onChange={(e) => updateField("signature_email", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signature-phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone (optional)
                </Label>
                <Input
                  id="signature-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={signature.signature_phone}
                  onChange={(e) => updateField("signature_phone", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signature-website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website (optional)
                </Label>
                <Input
                  id="signature-website"
                  placeholder="pageconsult.ai"
                  value={signature.signature_website}
                  onChange={(e) => updateField("signature_website", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signature-headshot" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Headshot URL (optional)
                </Label>
                <Input
                  id="signature-headshot"
                  placeholder="https://example.com/headshot.jpg"
                  value={signature.signature_headshot_url}
                  onChange={(e) => updateField("signature_headshot_url", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signature-html">Custom HTML Signature</Label>
              <p className="text-sm text-muted-foreground">
                Paste your HTML signature from generators like SignatureHound, WiseStamp, HubSpot, or MySignature
              </p>
              <Textarea
                id="signature-html"
                placeholder="<table>..."
                value={signature.signature_html}
                onChange={(e) => updateField("signature_html", e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Live Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-4 rounded-lg bg-muted/50 border text-sm overflow-auto max-h-64">
            {!signature.signature_enabled ? (
              <span className="text-muted-foreground italic">Signature disabled</span>
            ) : signature.signature_type === "html" && signature.signature_html ? (
              <div dangerouslySetInnerHTML={{ __html: signature.signature_html }} />
            ) : (
              renderSimplePreview()
            )}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Signature"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
