import { Package, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { operations } from "@/services/operations";

export default function Dashboard() {

  const today = new Date();

  const receipts = operations.filter(o => o.type === "receipt");
  const deliveries = operations.filter(o => o.type === "delivery");

  const receiptLate = receipts.filter(o => new Date(o.scheduledDate) < today).length;
  const receiptUpcoming = receipts.filter(o => new Date(o.scheduledDate) > today).length;

  const deliveryLate = deliveries.filter(o => new Date(o.scheduledDate) < today).length;
  const deliveryWaiting = deliveries.filter(o => o.status === "waiting").length;
  const deliveryUpcoming = deliveries.filter(o => new Date(o.scheduledDate) > today).length;

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Receipts */}
        <Link
          to="/operations/receipts"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              Receipts
            </h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium">{receiptUpcoming}</span> to receive</p>
            <p><span className="font-medium text-red-500">{receiptLate}</span> late</p>
            <p><span className="font-medium">{receipts.length}</span> operations</p>
          </div>
        </Link>

        {/* Deliveries */}
        <Link
          to="/operations/deliveries"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-purple-500" />
            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              Deliveries
            </h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium">{deliveryUpcoming}</span> to deliver</p>
            <p><span className="font-medium">{deliveryWaiting}</span> waiting</p>
            <p><span className="font-medium text-red-500">{deliveryLate}</span> late</p>
            <p><span className="font-medium">{deliveries.length}</span> operations</p>
          </div>
        </Link>

      </div>

    </div>
  );
}