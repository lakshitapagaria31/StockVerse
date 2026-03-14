import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Delivery, Product, Warehouse } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    Promise.all([api.deliveries.list(), api.products.list(), api.warehouses.list()]).then(
      ([deliveryRows, productRows, warehouseRows]) => {
        setDeliveries(deliveryRows);
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
      await api.deliveries.create({ productId: Number(productId), warehouseId: Number(warehouseId), quantity: Number(quantity) });
      setDeliveries(await api.deliveries.list());
      setCreateOpen(false);
      setProductId("");
      setWarehouseId("");
      setQuantity("1");
      toast.success("Delivery created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create delivery");
    }
  };

  return (
    <div>
      <PageHeader
        title="Deliveries"
        description="Manage outgoing stock (Pick → Pack → Ship)"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Delivery</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Delivery</DialogTitle></DialogHeader>
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
                  <Label>Warehouse *</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Quantity *</Label><Input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="1" required /></div>
                <Button type="submit" className="w-full">Create Delivery</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable
        columns={[
          { key: "reference", label: "Reference", render: (r) => <span className="font-medium">{r.reference}</span> },
          { key: "customer", label: "Customer" },
          { key: "date", label: "Date" },
          { key: "warehouse", label: "Warehouse" },
          { key: "items", label: "Items", render: (r: Delivery) => <span>{r.items.map(i => `${i.product} (${i.quantity})`).join(", ")}</span> },
          { key: "status", label: "Status", render: (r: Delivery) => <StatusBadge status={r.status} /> },
        ]}
        data={deliveries}
      />
    </div>
  );
};

export default Deliveries;
