import { Package, Download, AlertTriangle, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProducts, useLowStockProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StockReport() {
  const { data: allProducts = [], isLoading } = useProducts();
  const { data: lowStockProducts = [] } = useLowStockProducts(10);

  // Filter only products (not services) for stock calculations
  const products = allProducts.filter(p => p.item_type === "product");
  
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const stockValue = products.reduce((sum, p) => sum + (p.stock * p.cost_price), 0);
  const sellingValue = products.reduce((sum, p) => sum + (p.stock * p.selling_price), 0);
  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);

  // Get stock by category
  const stockByCategory = products.reduce((acc, p) => {
    const category = p.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { count: 0, stock: 0, value: 0 };
    }
    acc[category].count += 1;
    acc[category].stock += p.stock;
    acc[category].value += p.stock * p.cost_price;
    return acc;
  }, {} as Record<string, { count: number; stock: number; value: number }>);

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 5) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="outline" className="text-primary border-primary">In Stock</Badge>;
  };

  const handleExport = () => {
    const csvContent = [
      ["Product Name", "Category", "Stock", "Cost Price", "Selling Price", "Stock Value", "Status"].join(","),
      ...products.map(p => [
        `"${p.name}"`,
        `"${p.category || 'Uncategorized'}"`,
        p.stock,
        p.cost_price,
        p.selling_price,
        p.stock * p.cost_price,
        p.stock === 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Report</h1>
          <p className="text-muted-foreground">Monitor inventory levels and stock movement</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-2xl">{totalProducts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{totalStock} units in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stock Value</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stockValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">At cost price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-secondary-foreground" />
              Low Stock Items
            </CardDescription>
            <CardTitle className="text-2xl text-secondary-foreground">{lowStock.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Below 10 units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              Out of Stock
            </CardDescription>
            <CardTitle className="text-2xl text-destructive">{outOfStock.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock by Category */}
      {Object.keys(stockByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Stock by Category
            </CardTitle>
            <CardDescription>
              Inventory distribution across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stockByCategory)
                .sort((a, b) => b[1].value - a[1].value)
                .map(([category, data]) => {
                  const percentage = (data.value / stockValue) * 100 || 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">
                          {data.count} products • {data.stock} units • {formatCurrency(data.value)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock & Out of Stock Items */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Items Needing Attention
            </CardTitle>
            <CardDescription>
              Products that need to be restocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-right">Cost Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...outOfStock, ...lowStock]
                    .sort((a, b) => a.stock - b.stock)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.category || "Uncategorized"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={product.stock === 0 ? "text-destructive font-bold" : "text-secondary-foreground font-medium"}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(product.cost_price)}</TableCell>
                        <TableCell>{getStockBadge(product.stock)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Stock List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Complete Stock List
          </CardTitle>
          <CardDescription>
            All products with current stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No products yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add products to your inventory to track stock levels
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Cost Price</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.category || "Uncategorized"}
                        </TableCell>
                        <TableCell className="text-center font-medium">{product.stock}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.cost_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.selling_price)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(product.stock * product.cost_price)}
                        </TableCell>
                        <TableCell>{getStockBadge(product.stock)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
