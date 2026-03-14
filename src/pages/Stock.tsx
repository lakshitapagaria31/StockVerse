import { useState } from "react";
import { Search } from "lucide-react";

interface Product {
  id: number;
  name: string;
  cost: number;
  onHand: number;
  reserved: number;
}

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Desk", cost: 3000, onHand: 50, reserved: 5 },
    { id: 2, name: "Table", cost: 3000, onHand: 50, reserved: 0 },
  ]);

  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Stock
        </h1>

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1 bg-white dark:bg-gray-800">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search product..."
            className="bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="card overflow-hidden">

        <table>

          <thead>
            <tr className="text-left text-sm uppercase tracking-wide">
              <th className="p-4">Product</th>
              <th className="p-4">Per Unit Cost</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Free to Use</th>
            </tr>
          </thead>

          <tbody>

            {filteredProducts.map((product) => {
              const free = product.onHand - product.reserved;

              return (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">

                  <td className="p-4 font-medium">
                    {product.name}
                  </td>

                  <td className="p-4">
                    ₹{product.cost}
                  </td>

                  <td className="p-4">
                    {product.onHand}
                  </td>

                  <td className="p-4 font-medium">
                    {free}
                  </td>

                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}