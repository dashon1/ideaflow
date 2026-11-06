import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Crown, Star, Zap, Check, X } from "lucide-react";
import { TIER_LIMITS } from "@/data/platforms";
import { getTierPlatforms } from "@shared/platform-access";

interface User {
  id: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: string;
  apiQuotaUsed: number;
  apiQuotaLimit: number;
  platformAccess: string[];
}

export default function TierManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  const { data: pricing } = useQuery<{ tiers: { id: string; monthlyPrice: number }[] }>({
    queryKey: ["/api/pricing"],
  });

  const upgradeUserMutation = useMutation({
    mutationFn: async (newTier: 'starter' | 'professional' | 'enterprise') => {
      const response = await apiRequest('/api/stripe/checkout/subscription', 'POST', { tierId: newTier });
      const checkout = await response.json();
      if (!checkout.url) throw new Error("Checkout did not return a payment URL");
      window.location.assign(checkout.url);
    },
    onSuccess: (_, newTier) => {
      toast({
        title: "Continue to checkout",
        description: "Your plan changes only after payment is confirmed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>;
  }

  const currentTier = user?.subscriptionTier || 'starter';
  const tierLimits = TIER_LIMITS[currentTier] || TIER_LIMITS.starter;
  const quotaPercentage = user?.apiQuotaLimit === -1 ? 0 : 
    Math.round((user?.apiQuotaUsed || 0) / (user?.apiQuotaLimit || 1) * 100);

  const tiers = [
    {
      name: 'Starter',
      id: 'starter' as const,
       price: pricing ? `$${pricing.tiers.find(t => t.id === "starter")?.monthlyPrice}/month` : "Loading price…",
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
      features: TIER_LIMITS.starter.features,
      platformCount: TIER_LIMITS.starter.platforms.length,
      quota: TIER_LIMITS.starter.apiQuota,
      dailyJobs: TIER_LIMITS.starter.maxJobsPerDay
    },
    {
      name: 'Professional',
      id: 'professional' as const,
       price: pricing ? `$${pricing.tiers.find(t => t.id === "professional")?.monthlyPrice}/month` : "Loading price…",
      icon: <Star className="w-6 h-6" />,
      color: 'purple',
      features: TIER_LIMITS.professional.features,
      platformCount: TIER_LIMITS.professional.platforms.length,
      quota: TIER_LIMITS.professional.apiQuota,
      dailyJobs: TIER_LIMITS.professional.maxJobsPerDay
    },
    {
      name: 'Enterprise',
      id: 'enterprise' as const,
       price: pricing ? `$${pricing.tiers.find(t => t.id === "enterprise")?.monthlyPrice}/month` : "Loading price…",
      icon: <Crown className="w-6 h-6" />,
      color: 'gold',
      features: TIER_LIMITS.enterprise.features,
      platformCount: TIER_LIMITS.enterprise.platforms.length,
      quota: 'Unlimited',
      dailyJobs: 'Unlimited'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {tiers.find(t => t.id === currentTier)?.icon}
            <span>Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span>
          </CardTitle>
          <CardDescription>
            Your subscription status and usage metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={user?.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                {user?.subscriptionStatus || 'Active'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">API Usage</p>
              <p className="font-medium">
                {user?.apiQuotaUsed || 0} / {user?.apiQuotaLimit === -1 ? '∞' : user?.apiQuotaLimit || 100}
              </p>
              {user?.apiQuotaLimit !== -1 && (
                <Progress value={quotaPercentage} className="mt-1" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform Access</p>
              <p className="font-medium">{getTierPlatforms(currentTier).length} platforms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Jobs</p>
              <p className="font-medium">
                {tierLimits.maxJobsPerDay === -1 ? 'Unlimited' : tierLimits.maxJobsPerDay}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrentTier = tier.id === currentTier;
          const canUpgrade = tier.id !== currentTier && 
            (currentTier === 'starter' || (currentTier === 'professional' && tier.id === 'enterprise'));

          return (
            <Card key={tier.id} className={`relative ${isCurrentTier ? 'ring-2 ring-blue-500' : ''}`}>
              {isCurrentTier && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {tier.icon}
                    <span>{tier.name}</span>
                  </div>
                  <span className="text-lg font-bold">{tier.price}</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Platforms</span>
                    <span className="font-medium">{tier.platformCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>API Quota</span>
                    <span className="font-medium">{tier.quota}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Jobs</span>
                    <span className="font-medium">{tier.dailyJobs}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Features:</p>
                  <ul className="space-y-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  {isCurrentTier ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : canUpgrade ? (
                    <Button 
                      onClick={() => upgradeUserMutation.mutate(tier.id)}
                      disabled={upgradeUserMutation.isPending}
                      className="w-full"
                    >
                      {upgradeUserMutation.isPending ? 'Upgrading...' : `Upgrade to ${tier.name}`}
                    </Button>
                  ) : (
                    <Button disabled variant="outline" className="w-full">
                      {tier.id === 'starter' ? 'Downgrade to Starter' : 'Contact Sales'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}