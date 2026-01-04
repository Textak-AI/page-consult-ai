import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Bell, Eye, Calendar, Megaphone, Loader2 } from "lucide-react";

interface NotificationData {
  email_notifications: boolean;
  prospect_view_alerts: boolean;
  weekly_summary_emails: boolean;
  marketing_emails: boolean;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData>({
    email_notifications: true,
    prospect_view_alerts: true,
    weekly_summary_emails: true,
    marketing_emails: false,
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email_notifications, prospect_view_alerts, weekly_summary_emails, marketing_emails")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching notifications:", error);
        return;
      }

      if (data) {
        setNotifications({
          email_notifications: data.email_notifications ?? true,
          prospect_view_alerts: data.prospect_view_alerts ?? true,
          weekly_summary_emails: data.weekly_summary_emails ?? true,
          marketing_emails: data.marketing_emails ?? false,
        });
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
          ...notifications,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof NotificationData, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
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
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when we contact you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => updateField("email_notifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="prospect-alerts" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Prospect View Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone views your Quick Pivot page
              </p>
            </div>
            <Switch
              id="prospect-alerts"
              checked={notifications.prospect_view_alerts}
              onCheckedChange={(checked) => updateField("prospect_view_alerts", checked)}
              disabled={!notifications.email_notifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-summary" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Weekly Summary Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly digest of your page performance
              </p>
            </div>
            <Switch
              id="weekly-summary"
              checked={notifications.weekly_summary_emails}
              onCheckedChange={(checked) => updateField("weekly_summary_emails", checked)}
              disabled={!notifications.email_notifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive tips, product updates, and promotional content
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={notifications.marketing_emails}
              onCheckedChange={(checked) => updateField("marketing_emails", checked)}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
