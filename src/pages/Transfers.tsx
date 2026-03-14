import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, Transfer } from "@/services/api";
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
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { api.transfers.list().then(setTransfers); }, []);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const product = (fd.get("product") as string).trim();
    const quantity = Number(fd.get("quantity"));
    const src = fd.get("source") as string;
    const dest = fd.get("destination") as string;
    if (!product || quantity <= 0) { toast.error("Please fill all fields"); return; }
    if (src === dest) { toast.error("Source and destination must differ"); return; }
    const t: Transfer = {
      id: String(transfers.length + 1),
      reference: `TRF-${String(transfers.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      sourceLocation: src,
      destinationLocation: dest,
      items: [{ product, quantity }],
    };
    setTransfers([t, ...transfers]);
    setCreateOpen(false);
    toast.success("Transfer created");
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
                    <Select name="source" defaultValue="Warehouse A">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                        <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select name="destination" defaultValue="Warehouse B">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                        <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Product *</Label><Input name="product" required maxLength={200} /></div>
                <div className="space-y-2"><Label>Quantity *</Label><Input name="quantity" type="number" min="1" required /></div>
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
          { key: "items", label: "Items", render: (r) => <span>{(r.items as Transfer["items"]).map(i => `${i.product} (${i.quantity})`).join(", ")}</span> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
        ]}
        data={transfers as unknown as Record<string, unknown>[]}
      />
    </div>
  );
};

export default Transfers;
