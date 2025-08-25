import { useState } from "react";
import { Check, Star, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  monthlyCredits: number;
  creditsPerDollar: number;
  platforms: number;
  features: string[];
  isPopular?: boolean;
}

interface CreditPackage {
  name: string;
  credits: number;
  bonusCredits: number;
  priceUsd: string;
  stripePriceId: string;
  sortOrder: number;
}

interface PricingData {
  tiers: PricingTier[];
  creditCosts: Record<string, number>;
  packages: CreditPackage[];
}

export default function Pricing() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("subscriptions");

  const { data: pricingData, isLoading } = useQuery<PricingData>({
    queryKey: ['/api/pricing'],
  });

  const handleSubscribe = async (tierId: string) => {
    toast({
      title: "Subscription Selected",
      description: `Starting ${tierId} plan setup...`,
    });
    // In production, integrate with Stripe for subscription
  };

  const handlePurchaseCredits = async (packageName: string) => {
    toast({
      title: "Credits Purchase",
      description: `Purchasing ${packageName}...`,
    });
    // In production, integrate with Stripe for one-time purchase
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tiers = pricingData?.tiers || [];
  const packages = pricingData?.packages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
            <Star className="w-4 h-4 mr-1" />
            Market-Competitive Pricing
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-blue-600">IdeaFlow</span> Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover trending problems, generate AI-powered solutions, and build MVPs faster than ever.
            Pay only for what you use with our credit-based system.
          </p>
        </div>

        {/* Pricing Toggle */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
              Monthly Plans
            </TabsTrigger>
            <TabsTrigger value="credits" data-testid="tab-credits">
              Credit Packages
            </TabsTrigger>
          </TabsList>

          {/* Subscription Plans */}
          <TabsContent value="subscriptions" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier) => {
                const Icon = tier.id === 'starter' ? Zap : tier.id === 'professional' ? Shield : Crown;
                
                return (
                  <Card 
                    key={tier.id} 
                    className={`relative ${tier.isPopular 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : 'border-gray-200'
                    }`}
                    data-testid={`card-tier-${tier.id}`}
                  >
                    {tier.isPopular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                        Most Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-gray-900">
                          ${tier.monthlyPrice}
                          <span className="text-lg font-normal text-gray-500">/month</span>
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {tier.monthlyCredits} credits included
                        </div>
                        <div className="text-xs text-gray-500">
                          {tier.creditsPerDollar.toFixed(1)} credits per $1
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                          Access to <strong>{tier.platforms}</strong> platforms
                        </div>
                      </div>
                      
                      <ul className="space-y-3">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className={`w-full ${tier.isPopular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                        onClick={() => handleSubscribe(tier.id)}
                        data-testid={`button-subscribe-${tier.id}`}
                      >
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Credit Packages */}
          <TabsContent value="credits" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pay-as-you-go Credits</h3>
              <p className="text-gray-600">Perfect for occasional use or testing the platform</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {packages.map((pkg, index) => {
                const totalCredits = pkg.credits + pkg.bonusCredits;
                const priceNum = parseFloat(pkg.priceUsd);
                const pricePerCredit = priceNum / totalCredits;
                
                return (
                  <Card 
                    key={pkg.name} 
                    className={`${index === 1 ? 'border-blue-500 scale-105' : 'border-gray-200'}`}
                    data-testid={`card-package-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {index === 1 && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                        Best Value
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">${pkg.priceUsd}</div>
                        <div className="text-sm text-gray-600">
                          {pkg.credits} credits
                          {pkg.bonusCredits > 0 && (
                            <span className="text-green-600 font-medium">
                              {' '}+ {pkg.bonusCredits} bonus
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${pricePerCredit.toFixed(3)} per credit
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>• Platform scraping: 1-4 credits</div>
                        <div>• AI processing: 3-15 credits</div>
                        <div>• MVP generation: 50 credits</div>
                        <div>• Content creation: 8-25 credits</div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        variant={index === 1 ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handlePurchaseCredits(pkg.name)}
                        data-testid={`button-purchase-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        Purchase Credits
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Credit Usage Guide */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Credit Usage Guide</CardTitle>
              <CardDescription className="text-center">
                Understand how credits are consumed across different operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">Platform Scraping</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Reddit, Quora, Medium</span>
                      <span className="font-medium">1-2 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TikTok, LinkedIn, Instagram</span>
                      <span className="font-medium">3 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Twitter/X (API fees)</span>
                      <span className="font-medium">4 credits</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-purple-600">AI Processing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pain point analysis</span>
                      <span className="font-medium">5 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Idea classification</span>
                      <span className="font-medium">3 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MVP specification</span>
                      <span className="font-medium">15 credits</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}