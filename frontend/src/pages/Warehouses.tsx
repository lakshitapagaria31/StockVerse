import React, { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Warehouse } from "@/services/api";
import { toast } from "sonner";

const Warehouses: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);

  useEffect(() => {
    api.warehouses.list().then(setWarehouses).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Failed to load warehouses");
    });
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();

    if (!name) {
      toast.error("Warehouse name is required");
      return;
    }

    try {
      const created = await api.warehouses.create({ name, location: location || null });
      setWarehouses((current) => [created, ...current]);
      setCreateOpen(false);
      toast.success("Warehouse created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create warehouse");
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();

    if (!name) {
      toast.error("Warehouse name is required");
      return;
    }

    try {
      const updated = await api.warehouses.update(editing.id, { name, location: location || null });
      setWarehouses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setEditing(null);
      toast.success("Warehouse updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update warehouse");
    }
  };

  const handleDelete = async (warehouse: Warehouse) => {
    try {
      await api.warehouses.delete(warehouse.id);
      setWarehouses((current) => current.filter((item) => item.id !== warehouse.id));
      toast.success("Warehouse deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete warehouse");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Create and maintain storage locations used across stock operations"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Warehouse</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Warehouse</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse-name">Name</Label>
                  <Input id="warehouse-name" name="name" placeholder="Main Warehouse" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse-location">Location</Label>
                  <Input id="warehouse-location" name="location" placeholder="Delhi" />
                </div>
                <Button type="submit" className="w-full">Create Warehouse</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "location", label: "Location", sortable: true, render: (row: Warehouse) => row.location || "-" },
          {
            key: "actions",
            label: "Actions",
            render: (row: Warehouse) => (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditing(row);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDelete(row);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={warehouses}
        emptyMessage="No warehouses created yet"
      />

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Warehouse</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-warehouse-name">Name</Label>
              <Input id="edit-warehouse-name" name="name" defaultValue={editing?.name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-warehouse-location">Location</Label>
              <Input id="edit-warehouse-location" name="location" defaultValue={editing?.location ?? ""} />
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Warehouses;