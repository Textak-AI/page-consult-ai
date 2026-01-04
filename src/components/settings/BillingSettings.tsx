import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Zap, TrendingUp, ExternalLink, Loader2 } from "lucide-react";

export function BillingSettings() {
  const { user } = useAuth();
  const { credits, isLoading } = useCredits(user?.id || null);

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "agency":
        return "default";
      case "pro":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case "agency":
        return "Agency";
      case "pro":
        return "Pro";
      default:
        return "Starter";
    }
  };

  const creditsUsed = credits?.used || 0;
  const creditsTotal = credits?.total || 30;
  const creditsAvailable = credits?.available || 0;
  const usagePercentage = Math.min(100, (creditsUsed / creditsTotal) * 100);
  const plan = credits?.plan || "starter";

  if (isLoading) {
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
          <CreditCard className="h-5 w-5" />
          Billing & Subscription
        </CardTitle>
        <CardDescription>
          Manage your subscription and view usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {getPlanDisplayName(plan)}
              </span>
              <Badge variant={getPlanBadgeVariant(plan)}>
                {credits?.isUnlimited ? "Unlimited" : "Active"}
              </Badge>
            </div>
          </div>
          {!credits?.isUnlimited && (
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </div>

        {/* Credits Usage */}
        {!credits?.isUnlimited && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Credits</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {creditsAvailable} / {creditsTotal} remaining
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{creditsUsed} used this period</span>
                {(credits?.rollover || 0) > 0 && (
                  <span>+{credits?.rollover} rollover</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Billing Actions */}
        <Separator />
        <div className="grid gap-3">
          <Button variant="outline" className="justify-start gap-2">
            <CreditCard className="h-4 w-4" />
            Manage Payment Methods
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <ExternalLink className="h-4 w-4" />
            View Billing History
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          {plan !== "starter" && (
            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground">
              Cancel Subscription
            </Button>
          )}
        </div>

        {/* Plan Features */}
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium">Your plan includes:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {credits?.isUnlimited ? (
              <>
                <li>• Unlimited AI credits</li>
                <li>• Priority support</li>
                <li>• White-label options</li>
                <li>• Team collaboration</li>
                <li>• Custom branding</li>
              </>
            ) : credits?.isPro ? (
              <>
                <li>• {creditsTotal} AI credits per month</li>
                <li>• Credit rollover (up to 50)</li>
                <li>• Priority support</li>
                <li>• Advanced analytics</li>
              </>
            ) : (
              <>
                <li>• {creditsTotal} AI credits per month</li>
                <li>• Basic analytics</li>
                <li>• Email support</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
