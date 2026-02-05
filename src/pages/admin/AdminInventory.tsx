import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Product, Inventory } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Package, AlertTriangle, Loader2, Plus, Minus } from "lucide-react";

const AdminInventory = () => {
  const [products, setProducts] = useState<(Product & { inventory?: Inventory })[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`*, inventory(*)`)
      .order("name");

    if (!error && data) {
      setProducts(data.map(p => ({
        ...p,
        inventory: p.inventory?.[0]
      })) as (Product & { inventory?: Inventory })[]);
    }
    setLoading(false);
  };

  const updateQuantity = async (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product?.inventory) return;

    const newQuantity = Math.max(0, product.inventory.quantity + delta);
    setUpdating(productId);

    const { error } = await supabase
      .from("inventory")
      .update({ 
        quantity: newQuantity,
        last_restocked_at: delta > 0 ? new Date().toISOString() : product.inventory.last_restocked_at
      })
      .eq("product_id", productId);

    if (error) {
      toast.error("Failed to update inventory");
    } else {
      toast.success(`Stock ${delta > 0 ? "added" : "removed"}`);
      fetchProducts();
    }
    setUpdating(null);
  };

  const setQuantity = async (productId: string, quantity: number) => {
    setUpdating(productId);
    
    const { error } = await supabase
      .from("inventory")
      .update({ 
        quantity: Math.max(0, quantity),
        last_restocked_at: new Date().toISOString()
      })
      .eq("product_id", productId);

    if (error) {
      toast.error("Failed to update inventory");
    }
    setUpdating(null);
    fetchProducts();
  };

  const lowStockProducts = products.filter(p => 
    p.inventory && p.inventory.quantity <= p.inventory.reorder_level
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Inventory Management</h1>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-8 border-yellow-500 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-yellow-600" size={24} />
                <h2 className="font-semibold text-yellow-800">Low Stock Alert</h2>
              </div>
              <div className="space-y-2">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span>{p.name}</span>
                    <Badge variant="destructive">
                      {p.inventory?.quantity} remaining (reorder at {p.inventory?.reorder_level})
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="text-primary" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + (p.inventory?.quantity || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="text-yellow-500" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="text-green-500" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">In Stock Products</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => (p.inventory?.quantity || 0) > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const inventory = product.inventory;
                    const available = (inventory?.quantity || 0) - (inventory?.reserved_quantity || 0);
                    const isLow = inventory && inventory.quantity <= inventory.reorder_level;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                              {product.image_url ? (
                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  N/A
                                </div>
                              )}
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-20"
                              value={inventory?.quantity || 0}
                              onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 0)}
                              disabled={updating === product.id}
                            />
                            {isLow && <AlertTriangle className="text-yellow-500" size={16} />}
                          </div>
                        </TableCell>
                        <TableCell>{inventory?.reserved_quantity || 0}</TableCell>
                        <TableCell>
                          <Badge variant={available > 0 ? "default" : "destructive"}>
                            {available}
                          </Badge>
                        </TableCell>
                        <TableCell>{inventory?.reorder_level || 10}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {inventory?.warehouse_location || "Default"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(product.id, -1)}
                              disabled={updating === product.id || (inventory?.quantity || 0) <= 0}
                            >
                              <Minus size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(product.id, 1)}
                              disabled={updating === product.id}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminInventory;
