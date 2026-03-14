import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Adjustment, Product, Warehouse } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Adjustments: React.FC = () => {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [countedQuantity, setCountedQuantity] = useState("0");

  useEffect(() => {
    Promise.all([api.adjustments.list(), api.products.list(), api.warehouses.list()]).then(
      ([adjustmentRows, productRows, warehouseRows]) => {
        setAdjustments(adjustmentRows);
        setProducts(productRows);
        setWarehouses(warehouseRows);
      },
    );
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId || !warehouseId || Number(countedQuantity) < 0) {
      toast.error("Please select product, warehouse, and counted quantity");
      return;
    }

    try {
      await api.adjustments.create({ productId: Number(productId), warehouseId: Number(warehouseId), countedQuantity: Number(countedQuantity) });
      setAdjustments(await api.adjustments.list());
      setCreateOpen(false);
      setProductId("");
      setWarehouseId("");
      setCountedQuantity("0");
      toast.success("Adjustment created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create adjustment");
    }
  };

  return (
    <div>
      <PageHeader
        title="Inventory Adjustments"
        description="Reconcile physical and system stock"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Adjustment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Adjustment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warehouse</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Counted Qty</Label><Input value={countedQuantity} onChange={(event) => setCountedQuantity(event.target.value)} type="number" min="0" required /></div>
                <Button type="submit" className="w-full">Submit Adjustment</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable
        columns={[
          { key: "reference", label: "Reference", render: (r) => <span className="font-medium">{r.reference}</span> },
          { key: "date", label: "Date" },
          { key: "product", label: "Product" },
          { key: "location", label: "Location" },
          { key: "systemQuantity", label: "System Qty" },
          { key: "countedQuantity", label: "Counted Qty" },
          { key: "difference", label: "Diff", render: (r: Adjustment) => {
            const d = r.difference;
            return <span className={d > 0 ? "text-success font-medium" : d < 0 ? "text-destructive font-medium" : ""}>{d > 0 ? `+${d}` : d}</span>;
          }},
          { key: "status", label: "Status", render: (r: Adjustment) => <StatusBadge status={r.status} /> },
        ]}
        data={adjustments}
      />
    </div>
  );
};

export default Adjustments;
