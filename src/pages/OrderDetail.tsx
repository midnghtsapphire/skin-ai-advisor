import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, Product, Address } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, RotateCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};

const OrderDetail = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<(OrderItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/orders");
      return;
    }
    if (user && id) {
      fetchOrder();
    }
  }, [user, authLoading, id]);

  const fetchOrder = async () => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (orderError || !orderData) {
      toast.error("Order not found");
      navigate("/orders");
      return;
    }

    setOrder(orderData as unknown as Order);

    const { data: itemsData } = await supabase
      .from("order_items")
      .select(`*, products(*)`)
      .eq("order_id", id);

    if (itemsData) {
      setItems(itemsData.map(item => ({
        ...item,
        product: item.products as unknown as Product
      })) as (OrderItem & { product: Product })[]);
    }
    setLoading(false);
  };

  const handleRequestReturn = async () => {
    if (!order || !user) return;
    
    const { error } = await supabase
      .from("returns")
      .insert({
        order_id: order.id,
        user_id: user.id,
        reason: "Customer requested return",
        refund_amount: order.total,
      });

    if (error) {
      toast.error("Failed to request return");
      return;
    }

    toast.success("Return request submitted");
    navigate("/returns");
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

  if (!order) return null;

  const shippingAddress = order.shipping_address as Address | null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Order #{order.order_number}
            </h1>
            <p className="text-muted-foreground text-sm">
              Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge className={`ml-auto ${statusColors[order.status] || "bg-gray-100"}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product?.name || "Product"}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.total_price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unit_price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Info */}
            {shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck size={20} />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{shippingAddress.name}</p>
                  <p className="text-muted-foreground">{shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress.country}</p>
                  {order.tracking_number && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p className="text-primary">{order.tracking_number}</p>
                      {order.carrier && (
                        <p className="text-sm text-muted-foreground">via {order.carrier}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>

                {order.status === "delivered" && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleRequestReturn}
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Request Return
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
