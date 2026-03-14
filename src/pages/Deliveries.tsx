import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Delivery } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { api.deliveries.list().then(setDeliveries); }, []);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const customer = (fd.get("customer") as string).trim();
    const product = (fd.get("product") as string).trim();
    const quantity = Number(fd.get("quantity"));
    if (!customer || !product || quantity <= 0) { toast.error("Please fill all fields with valid values"); return; }
    const del: Delivery = {
      id: String(deliveries.length + 1),
      reference: `DEL-${String(deliveries.length + 1).padStart(3, "0")}`,
      customer,
      date: new Date().toISOString().split("T")[0],
      status: "pick",
      items: [{ product, quantity }],
      warehouse: "Warehouse A",
    };
    setDeliveries([del, ...deliveries]);
    setCreateOpen(false);
    toast.success("Delivery created");
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
                <div className="space-y-2"><Label>Customer *</Label><Input name="customer" required maxLength={200} /></div>
                <div className="space-y-2"><Label>Product *</Label><Input name="product" required maxLength={200} /></div>
                <div className="space-y-2"><Label>Quantity *</Label><Input name="quantity" type="number" min="1" required /></div>
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
