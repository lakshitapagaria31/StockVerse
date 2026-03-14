import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Product, Receipt, Warehouse } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    Promise.all([api.receipts.list(), api.products.list(), api.warehouses.list()]).then(
      ([receiptRows, productRows, warehouseRows]) => {
        setReceipts(receiptRows);
        setProducts(productRows);
        setWarehouses(warehouseRows);
      },
    );
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId || !warehouseId || Number(quantity) <= 0) {
      toast.error("Please select product, warehouse, and quantity");
      return;
    }

    try {
      await api.receipts.create({ productId: Number(productId), warehouseId: Number(warehouseId), quantity: Number(quantity) });
      setReceipts(await api.receipts.list());
      setCreateOpen(false);
      setProductId("");
      setWarehouseId("");
      setQuantity("1");
      toast.success("Receipt created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create receipt");
    }
  };

  return (
    <div>
      <PageHeader
        title="Receipts"
        description="Manage incoming stock"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Receipt</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Receipt</DialogTitle></DialogHeader>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quantity *</Label><Input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="1" required /></div>
                  <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Receipt</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable
        columns={[
          { key: "reference", label: "Reference", render: (r) => <span className="font-medium">{r.reference}</span> },
          { key: "supplier", label: "Source" },
          { key: "date", label: "Date" },
          { key: "warehouse", label: "Warehouse" },
          { key: "items", label: "Items", render: (r: Receipt) => <span>{r.items.map(i => `${i.product} (${i.quantity})`).join(", ")}</span> },
          { key: "status", label: "Status", render: (r: Receipt) => <StatusBadge status={r.status} /> },
        ]}
        data={receipts}
      />
    </div>
  );
};

export default Receipts;
