import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Return } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  received: "bg-blue-100 text-blue-800",
  refunded: "bg-purple-100 text-purple-800",
};

const Returns = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/returns");
      return;
    }
    if (user) {
      fetchReturns();
    }
  }, [user, authLoading]);

  const fetchReturns = async () => {
    const { data, error } = await supabase
      .from("returns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReturns(data as Return[]);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex justify-center">
          <Loader2 className="animate-spin" size={32} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Returns</h1>

        {returns.length === 0 ? (
          <div className="text-center py-16">
            <RotateCcw size={64} className="mx-auto text-muted-foreground mb-6" />
            <h2 className="text-xl font-semibold mb-4">No returns</h2>
            <p className="text-muted-foreground mb-8">
              You haven't requested any returns yet.
            </p>
            <Link to="/orders">
              <Button>View Orders</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => (
              <Card key={ret.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Return Request
                  </CardTitle>
                  <Badge className={statusColors[ret.status] || "bg-gray-100"}>
                    {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        Requested on {format(new Date(ret.requested_at), "MMMM d, yyyy")}
                      </p>
                      <p className="text-muted-foreground">Reason: {ret.reason}</p>
                      {ret.refund_amount && (
                        <p className="text-muted-foreground">
                          Refund amount: ${ret.refund_amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Link to={`/orders/${ret.order_id}`}>
                        <Button variant="outline" size="sm">
                          View Order
                          <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Returns;
