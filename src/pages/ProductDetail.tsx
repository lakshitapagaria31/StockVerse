import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, Product } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  useEffect(() => {
    if (id) api.products.get(id).then((data) => {
      // API returns array in mock mode
      if (Array.isArray(data)) {
        setProduct((data as Product[]).find(p => p.id === id) || null);
      } else {
        setProduct(data);
      }
    });
  }, [id]);

  if (!product) return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/products")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
      </Button>

      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku} · ${product.category} · ${product.unitOfMeasure}`}
        actions={
          <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Adjust Stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Stock adjusted"); setAdjustOpen(false); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input defaultValue={product.location} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>New Quantity</Label>
                  <Input type="number" min="0" required placeholder="Enter counted quantity" />
                </div>
                <Button type="submit" className="w-full">Submit Adjustment</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Stock by Location</h3>
            <DataTable
              columns={[
                { key: "location", label: "Location" },
                { key: "quantity", label: "Quantity", render: (r: { location: string; quantity: number }) => <span className="font-medium">{r.quantity}</span> },
              ]}
              data={product.stockByLocation}
              emptyMessage="No stock data"
            />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Summary</h3>
          <dl className="space-y-3">
            {[
              ["Total Stock", product.totalStock],
              ["Category", product.category],
              ["Unit", product.unitOfMeasure],
              ["Primary Location", product.location],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium text-card-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
