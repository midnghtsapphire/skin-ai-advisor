import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Product, Inventory, ProductStatus } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, DollarSign, TrendingUp, Loader2 } from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState<(Product & { inventory?: Inventory })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    sku: string;
    category: string;
    brand: string;
    image_url: string;
    my_cost: number;
    selling_price: number;
    status: ProductStatus;
    is_affiliate: boolean;
    affiliate_link: string;
    affiliate_commission_rate: number;
  }>({
    name: "",
    description: "",
    sku: "",
    category: "",
    brand: "",
    image_url: "",
    my_cost: 0,
    selling_price: 0,
    status: "active",
    is_affiliate: false,
    affiliate_link: "",
    affiliate_commission_rate: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`*, inventory(*)`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data.map(p => ({
        ...p,
        inventory: p.inventory?.[0]
      })) as (Product & { inventory?: Inventory })[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(formData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }
      toast.success("Product updated");
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(formData)
        .select()
        .single();

      if (error) {
        toast.error("Failed to create product");
        return;
      }

      // Create inventory record
      await supabase.from("inventory").insert({
        product_id: data.id,
        quantity: 0,
      });

      toast.success("Product created");
    }

    setIsDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      sku: product.sku || "",
      category: product.category || "",
      brand: product.brand || "",
      image_url: product.image_url || "",
      my_cost: product.my_cost,
      selling_price: product.selling_price,
      status: product.status,
      is_affiliate: product.is_affiliate,
      affiliate_link: product.affiliate_link || "",
      affiliate_commission_rate: product.affiliate_commission_rate || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete product");
      return;
    }
    toast.success("Product deleted");
    fetchProducts();
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      category: "",
      brand: "",
      image_url: "",
      my_cost: 0,
      selling_price: 0,
      status: "active",
      is_affiliate: false,
      affiliate_link: "",
      affiliate_commission_rate: 0,
    });
  };

  const totalValue = products.reduce((sum, p) => sum + (p.inventory?.quantity || 0) * p.my_cost, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.inventory?.quantity || 0) * p.selling_price, 0);
  const avgMarkup = products.length > 0 
    ? products.reduce((sum, p) => sum + (p.markup_percentage || 0), 0) / products.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Product Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>My Cost ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.my_cost}
                      onChange={(e) => setFormData({ ...formData, my_cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Selling Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Image URL</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_affiliate"
                      checked={formData.is_affiliate}
                      onChange={(e) => setFormData({ ...formData, is_affiliate: e.target.checked })}
                    />
                    <Label htmlFor="is_affiliate">Affiliate Product</Label>
                  </div>
                  {formData.is_affiliate && (
                    <>
                      <div className="sm:col-span-2">
                        <Label>Affiliate Link</Label>
                        <Input
                          value={formData.affiliate_link}
                          onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Commission Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.affiliate_commission_rate}
                          onChange={(e) => setFormData({ ...formData, affiliate_commission_rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Update" : "Create"} Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="text-primary" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <DollarSign className="text-green-500" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Value (Cost)</p>
                  <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="text-blue-500" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Markup</p>
                  <p className="text-2xl font-bold">{avgMarkup.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
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
                    <TableHead>My Cost</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Markup</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
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
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                      <TableCell>${product.my_cost.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">${product.selling_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.markup_percentage > 50 ? "default" : "secondary"}>
                          {product.markup_percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{product.inventory?.quantity || 0}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
