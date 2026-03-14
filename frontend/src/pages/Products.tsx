import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { api, Product } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const perPage = 5;

  useEffect(() => {
    api.products.list().then(setProducts);
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const sku = (fd.get("sku") as string).trim();
    if (!name || !sku) { toast.error("Name and SKU are required"); return; }
    if (products.some(p => p.sku === sku)) { toast.error("Duplicate SKU"); return; }
    try {
      const newProduct = await api.products.create({
        name,
        sku,
        category: (fd.get("category") as string) || "General",
        unitOfMeasure: (fd.get("uom") as string) || "Unit",
      });
      setProducts([newProduct, ...products]);
      setCreateOpen(false);
      toast.success("Product created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    }
  };

  const stockVariant = (stock: number) => {
    if (stock === 0) return "text-destructive";
    if (stock < 10) return "text-warning";
    return "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Product</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" required placeholder="Enter product name" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU Code *</Label>
                  <Input id="sku" name="sku" required placeholder="e.g. WM-001" maxLength={50} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" placeholder="Electronics" maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uom">Unit of Measure</Label>
                    <Input id="uom" name="uom" placeholder="Unit" maxLength={50} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input id="stock" name="stock" type="number" min="0" placeholder="0" />
                </div>
                <Button type="submit" className="w-full">Create Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
<div className="flex items-center justify-between gap-4 bg-white border rounded-xl p-4 shadow-sm">

<div className="flex gap-3 flex-1 max-w-md">

  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <Input
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      placeholder="Search products..."
      className="pl-9 h-9 bg-white"
    />
  </div>

  <Select
    value={categoryFilter}
    onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}
  >
    <SelectTrigger className="w-[140px] h-9">
      <SelectValue placeholder="Category" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="electronics">Electronics</SelectItem>
      <SelectItem value="accessories">Accessories</SelectItem>
      <SelectItem value="furniture">Furniture</SelectItem>
    </SelectContent>

  </Select>

</div>

<p className="text-sm text-muted-foreground">
  {filtered.length} products
</p>

</div>

{/* Table */}
<div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
<div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"></div>
  <DataTable
    columns={[
      { key: "name", label: "Product", sortable: true },
    
      {
        key: "sku",
        label: "SKU",
        sortable: true,
        render: (r: Product) => (
          <span className="font-mono text-xs text-muted-foreground">
            {r.sku}
          </span>
        ),
      },
    
      { key: "category", label: "Category", sortable: true },
      { key: "unitOfMeasure", label: "UoM", sortable: true },
    
      {
        key: "totalStock",
        label: "Stock",
        sortable: true,
        render: (r: Product) => (
          <span className={`font-semibold ${stockVariant(r.totalStock)}`}>
            {r.totalStock}
          </span>
        ),
      },
    
      { key: "location", label: "Location" },
    ]}
    data={paginated}
    onRowClick={(r) => navigate(`/products/${r.id}`)}
  />

</div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} products</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 rounded-md text-sm transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
