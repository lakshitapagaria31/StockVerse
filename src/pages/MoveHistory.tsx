import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, StockMovement } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MoveHistory: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { api.movements.list().then(setMovements); }, []);

  const filtered = movements.filter((m) => {
    const matchSearch = m.product.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.operationType.toLowerCase() === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Move History" description="Complete stock movement ledger" />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product..." className="pl-9 h-9" maxLength={200} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={[
          { key: "timestamp", label: "Timestamp", render: (r: StockMovement) => <span className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</span> },
          { key: "product", label: "Product" },
          { key: "operationType", label: "Type", render: (r: StockMovement) => {
            const colors: Record<string, string> = { Receipt: "text-success", Delivery: "text-primary", Transfer: "text-warning", Adjustment: "text-destructive" };
            return <span className={`text-xs font-medium ${colors[r.operationType] || ""}`}>{r.operationType}</span>;
          }},
          { key: "quantity", label: "Qty", render: (r: StockMovement) => {
            const q = r.quantity;
            return <span className={q > 0 ? "text-success font-medium" : "text-destructive font-medium"}>{q > 0 ? `+${q}` : q}</span>;
          }},
          { key: "sourceLocation", label: "From" },
          { key: "destinationLocation", label: "To" },
          { key: "performedBy", label: "By" },
        ]}
        data={filtered}
      />
    </div>
  );
};

export default MoveHistory;
