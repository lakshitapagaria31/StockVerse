import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  code: string;
}

interface Warehouse {
  id: string;
  name: string;
  locations: Location[];
}

const initialWarehouses: Warehouse[] = [
  {
    id: "1",
    name: "Warehouse A",
    locations: [
      { id: "l1", name: "Rack A1", code: "A1" },
      { id: "l2", name: "Rack A2", code: "A2" },
      { id: "l3", name: "Rack A3", code: "A3" },
    ],
  },
  {
    id: "2",
    name: "Warehouse B",
    locations: [
      { id: "l4", name: "Rack B1", code: "B1" },
      { id: "l5", name: "Rack B2", code: "B2" },
    ],
  },
];

const SettingsPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }

    setWarehouses([
      ...warehouses,
      {
        id: crypto.randomUUID(),
        name,
        locations: [],
      },
    ]);

    setAddOpen(false);
    toast.success("Warehouse added");
  };

  const addLocation = (warehouseId: string) => {
    const name = prompt("Enter location name:");
    if (!name?.trim()) return;

    const code = prompt("Enter short code (optional)") || "";

    const newLocation: Location = {
      id: crypto.randomUUID(),
      name: name.trim(),
      code,
    };

    setWarehouses(
      warehouses.map((w) =>
        w.id === warehouseId
          ? { ...w, locations: [...w.locations, newLocation] }
          : w
      )
    );

    toast.success("Location added");
  };

  const removeLocation = (warehouseId: string, locId: string) => {
    setWarehouses(
      warehouses.map((w) =>
        w.id === warehouseId
          ? {
              ...w,
              locations: w.locations.filter((l) => l.id !== locId),
            }
          : w
      )
    );

    toast.success("Location removed");
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage warehouses and storage locations"
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Warehouse
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Warehouse</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Warehouse Name *</Label>
                  <Input name="name" required maxLength={200} />
                </div>

                <Button type="submit" className="w-full">
                  Add Warehouse
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-4">
        {warehouses.map((w) => (
          <div
            key={w.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-card-foreground">
                {w.name}
              </h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => addLocation(w.id)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Location
              </Button>
            </div>

            {w.locations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {w.locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-1 rounded-md border border-border bg-muted px-2.5 py-1 text-sm"
                  >
                    {loc.name} {loc.code && `(${loc.code})`}

                    <button
                      onClick={() => removeLocation(w.id, loc.id)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No locations configured
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;