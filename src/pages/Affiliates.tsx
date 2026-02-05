import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateProgram } from "@/types/ecommerce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Search, Star, DollarSign, Clock, Loader2 } from "lucide-react";

const Affiliates = () => {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from("affiliate_programs")
      .select("*")
      .eq("is_active", true)
      .order("tier", { ascending: false });

    if (!error && data) {
      setPrograms(data as AffiliateProgram[]);
    }
    setLoading(false);
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(search.toLowerCase()) ||
      program.description?.toLowerCase().includes(search.toLowerCase()) ||
      program.category?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = activeTab === "all" || program.tier === activeTab;
    return matchesSearch && matchesTier;
  });

  const tiers = ["all", "premium", "standard"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Affiliate Programs
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Partner with the best skincare and beauty brands. Earn commissions by recommending products you love.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Programs</TabsTrigger>
              <TabsTrigger value="premium">
                <Star size={14} className="mr-2" />
                Premium
              </TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
            </TabsList>

            {tiers.map((tier) => (
              <TabsContent key={tier} value={tier} className="mt-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                ) : filteredPrograms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No programs found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredPrograms.map((program) => (
                      <Card key={program.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {program.name}
                                {program.tier === "premium" && (
                                  <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                                    <Star size={12} className="mr-1" />
                                    Premium
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {program.category}
                              </CardDescription>
                            </div>
                            {program.signup_url && (
                              <Button size="sm" asChild>
                                <a href={program.signup_url} target="_blank" rel="noopener noreferrer">
                                  Join Now
                                  <ExternalLink size={14} className="ml-2" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {program.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {program.commission_rate && (
                              <div className="flex items-center gap-1 text-green-600">
                                <DollarSign size={16} />
                                <span className="font-medium">{program.commission_rate} Commission</span>
                              </div>
                            )}
                            {program.cookie_duration && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock size={16} />
                                <span>{program.cookie_duration} Cookie</span>
                              </div>
                            )}
                            {program.website && (
                              <a
                                href={`https://${program.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink size={16} />
                                {program.website}
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Marketing Tips */}
          <Card className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>💡 Marketing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Create Authentic Content</h4>
                <p className="text-muted-foreground">
                  Share your genuine experience with products. Reviews, tutorials, and before/after content perform best.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Leverage Social Media</h4>
                <p className="text-muted-foreground">
                  Use Instagram, TikTok, and YouTube to showcase products. Short-form video content drives high engagement.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Build an Email List</h4>
                <p className="text-muted-foreground">
                  Email marketing converts better than social media. Share exclusive deals with your subscribers.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Track Your Performance</h4>
                <p className="text-muted-foreground">
                  Use affiliate dashboards to monitor clicks, conversions, and earnings. Optimize what works.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Affiliates;
