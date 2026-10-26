import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Webhook, Loader2, Send, CheckCircle2, XCircle } from "lucide-react";

interface Delivery {
  id: string;
  event_type: string;
  status: string;
  response_status: number | null;
  error: string | null;
  attempt_count: number;
  created_at: string;
}

function isValidWebhookUrl(value: string): boolean {
  if (!value) return true; // empty = cleared, allowed
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function WebhookSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("lead_webhook_url")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching webhook settings:", error);
        return;
      }
      setWebhookUrl(data?.lead_webhook_url ?? "");
    } catch (error) {
      console.error("Error fetching webhook settings:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDeliveries = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("webhook_deliveries")
      .select("id, event_type, status, response_status, error, attempt_count, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error("Error fetching deliveries:", error);
      return;
    }
    setDeliveries(data ?? []);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchDeliveries();
    }
  }, [user, fetchSettings, fetchDeliveries]);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = webhookUrl.trim();
    if (!isValidWebhookUrl(trimmed)) {
      toast.error("Webhook URL must be a valid https:// URL");
      return;
    }
    setSaving(true);
    try {
      // Upsert: older accounts may have no profiles row yet
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, lead_webhook_url: trimmed || null });
      if (error) throw error;
      setWebhookUrl(trimmed);
      toast.success(trimmed ? "Webhook URL saved" : "Webhook URL cleared");
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast.error("Failed to save webhook URL");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!user) return;
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-lead-webhook", { body: {} });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Test delivered — endpoint responded ${data.responseStatus}`);
      } else {
        toast.error(`Test failed: ${data?.error || "unknown error"}`);
      }
      await fetchDeliveries();
    } catch (error) {
      console.error("Error sending test webhook:", error);
      toast.error("Failed to send test webhook");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Lead Webhook
          </CardTitle>
          <CardDescription>
            Send every captured lead to your CRM. When someone submits a form on one of your
            published pages, we POST the lead as JSON to this URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-webhook-url">Webhook URL (HTTPS only)</Label>
            <Input
              id="lead-webhook-url"
              type="url"
              placeholder="https://your-crm.com/webhooks/pageconsult"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Payload: {"{ event: \"lead.created\", page: { title, slug }, lead: {…}, submitted_at }"}.
              Deliveries time out after 5 seconds with one retry on network failure.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
            <Button
              variant="outline"
              onClick={handleSendTest}
              disabled={testing || !webhookUrl.trim() || !isValidWebhookUrl(webhookUrl.trim())}
            >
              {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Test
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>The last 10 webhook deliveries for your leads.</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deliveries yet.</p>
          ) : (
            <ul className="space-y-2">
              {deliveries.map((d) => (
                <li key={d.id} className="flex items-center gap-3 text-sm">
                  {d.status === "delivered" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                  <span className="font-medium">{d.event_type}</span>
                  <span className="text-muted-foreground">
                    {d.response_status ? `HTTP ${d.response_status}` : d.error || "failed"}
                    {d.attempt_count > 1 ? ` · ${d.attempt_count} attempts` : ""}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
