import { Package, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900">
        Dashboard
      </h1>

      {/* Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
            <p><span className="font-medium">4</span> to receive</p>
            <p><span className="font-medium text-red-500">1</span> late</p>
            <p><span className="font-medium">6</span> operations</p>
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
            <p><span className="font-medium">2</span> waiting</p>
            <p><span className="font-medium text-red-500">1</span> late</p>
            <p><span className="font-medium">6</span> operations</p>
          </div>
        </Link>

      </div>

    </div>
  );
}