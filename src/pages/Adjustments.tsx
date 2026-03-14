import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Adjustment } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Adjustments: React.FC = () => {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { api.adjustments.list().then(setAdjustments); }, []);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const product = (fd.get("product") as string).trim();
    const systemQty = Number(fd.get("systemQuantity"));
    const countedQty = Number(fd.get("countedQuantity"));
    if (!product || systemQty < 0 || countedQty < 0) { toast.error("Please fill all fields with valid values"); return; }
    const adj: Adjustment = {
      id: String(adjustments.length + 1),
      reference: `ADJ-${String(adjustments.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      product,
      location: fd.get("location") as string || "Warehouse A",
      systemQuantity: systemQty,
      countedQuantity: countedQty,
      difference: countedQty - systemQty,
      status: "draft",
    };
    setAdjustments([adj, ...adjustments]);
    setCreateOpen(false);
    toast.success("Adjustment created");
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
                <div className="space-y-2"><Label>Product *</Label><Input name="product" required maxLength={200} /></div>
                <div className="space-y-2"><Label>Location</Label><Input name="location" defaultValue="Warehouse A" maxLength={200} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>System Qty</Label><Input name="systemQuantity" type="number" min="0" required /></div>
                  <div className="space-y-2"><Label>Counted Qty</Label><Input name="countedQuantity" type="number" min="0" required /></div>
                </div>
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
