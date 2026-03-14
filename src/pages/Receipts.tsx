import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Receipt } from "@/services/api";
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
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { api.receipts.list().then(setReceipts); }, []);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const supplier = (fd.get("supplier") as string).trim();
    const product = (fd.get("product") as string).trim();
    const quantity = Number(fd.get("quantity"));
    if (!supplier || !product || quantity <= 0) { toast.error("Please fill all fields with valid values"); return; }
    const rec: Receipt = {
      id: String(receipts.length + 1),
      reference: `REC-${String(receipts.length + 1).padStart(3, "0")}`,
      supplier,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      items: [{ product, quantity }],
      warehouse: fd.get("warehouse") as string || "Warehouse A",
    };
    setReceipts([rec, ...receipts]);
    setCreateOpen(false);
    toast.success("Receipt created");
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
                <div className="space-y-2"><Label>Supplier *</Label><Input name="supplier" required maxLength={200} /></div>
                <div className="space-y-2"><Label>Product *</Label><Input name="product" required maxLength={200} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quantity *</Label><Input name="quantity" type="number" min="1" required /></div>
                  <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Select name="warehouse" defaultValue="Warehouse A">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                        <SelectItem value="Warehouse B">Warehouse B</SelectItem>
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
          { key: "supplier", label: "Supplier" },
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
