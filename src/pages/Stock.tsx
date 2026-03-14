import { useState } from "react";

export default function Stock() {

  const [products, setProducts] = useState([
    { id: 1, name: "Desk", cost: 3000, onHand: 50, free: 45 },
    { id: 2, name: "Table", cost: 3000, onHand: 50, free: 50 }
  ]);

  const updateStock = (id:number, value:number) => {
    setProducts(products.map(p =>
      p.id === id
        ? { ...p, onHand: value }
        : p
    ));
  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Stock
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Per Unit Cost</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Free to Use</th>
            </tr>
          </thead>

          <tbody>

            {products.map(product => (
              <tr key={product.id} className="border-t">

                <td className="p-4 font-medium">
                  {product.name}
                </td>

                <td className="p-4">
                  ₹ {product.cost}
                </td>

                <td className="p-4">

                  <input
                    type="number"
                    value={product.onHand}
                    onChange={(e) =>
                      updateStock(product.id, Number(e.target.value))
                    }
                    className="w-20 border rounded px-2 py-1"
                  />

                </td>

                <td className="p-4">
                  {product.free}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}