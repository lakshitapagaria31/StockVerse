import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Product, Transfer, Warehouse } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Transfers: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    Promise.all([api.transfers.list(), api.products.list(), api.warehouses.list()]).then(
      ([transferRows, productRows, warehouseRows]) => {
        setTransfers(transferRows);
        setProducts(productRows);
        setWarehouses(warehouseRows);
      },
    );
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId || !sourceWarehouseId || !destinationWarehouseId || Number(quantity) <= 0) {
      toast.error("Please complete all fields");
      return;
    }
    if (sourceWarehouseId === destinationWarehouseId) { toast.error("Source and destination must differ"); return; }

    try {
      await api.transfers.create({
        productId: Number(productId),
        sourceWarehouseId: Number(sourceWarehouseId),
        destinationWarehouseId: Number(destinationWarehouseId),
        quantity: Number(quantity),
      });
      setTransfers(await api.transfers.list());
      setCreateOpen(false);
      setProductId("");
      setSourceWarehouseId("");
      setDestinationWarehouseId("");
      setQuantity("1");
      toast.success("Transfer created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transfer");
    }
  };

  return (
    <div>
      <PageHeader
        title="Internal Transfers"
        description="Move stock between locations"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Transfer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Transfer</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select value={sourceWarehouseId} onValueChange={setSourceWarehouseId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select value={destinationWarehouseId} onValueChange={setDestinationWarehouseId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                <div className="space-y-2"><Label>Quantity *</Label><Input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="1" required /></div>
                <Button type="submit" className="w-full">Create Transfer</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable
        columns={[
          { key: "reference", label: "Reference", render: (r) => <span className="font-medium">{r.reference}</span> },
          { key: "date", label: "Date" },
          { key: "sourceLocation", label: "From" },
          { key: "destinationLocation", label: "To" },
          { key: "items", label: "Items", render: (r: Transfer) => <span>{r.items.map(i => `${i.product} (${i.quantity})`).join(", ")}</span> },
          { key: "status", label: "Status", render: (r: Transfer) => <StatusBadge status={r.status} /> },
        ]}
        data={transfers}
      />
    </div>
  );
};

export default Transfers;
