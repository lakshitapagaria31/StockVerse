import { Building2, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, DashboardData } from "@/services/api";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {
      setStats(null);
    });
  }, []);

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900">
        Dashboard
      </h1>

      {/* Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link
          to="/warehouses"
          className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-lg text-gray-800">Warehouses</h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">{stats?.scheduledTransfers ?? 0}</span> transfer logs</p>
            <p>Manage storage locations</p>
          </div>
        </Link>

        {/* Receipt Card */}
        <Link
          to="/operations/receipts"
          className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-lg text-gray-800">Receipts</h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">{stats?.pendingReceipts ?? 0}</span> pending</p>
            <p><span className="font-medium">{stats?.totalProducts ?? 0}</span> products tracked</p>
            <p>Inbound stock records</p>
          </div>
        </Link>

        {/* Delivery Card */}
        <Link
          to="/operations/deliveries"
          className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-purple-500" />
            <h2 className="font-semibold text-lg text-gray-800">Deliveries</h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">{stats?.pendingDeliveries ?? 0}</span> pending</p>
            <p><span className="font-medium">{stats?.scheduledTransfers ?? 0}</span> transfers logged</p>
            <p>Outbound stock records</p>
          </div>
        </Link>

      </div>

    </div>
  );
}