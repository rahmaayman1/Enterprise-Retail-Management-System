import React from "react";

const Purchase = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Purchase Overview</h1>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Purchases */}
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:scale-105 transition-transform">
          <h2 className="text-gray-500 text-sm font-medium">Total Purchases</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">$18,320</p>
        </div>

        {/* Orders Placed */}
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:scale-105 transition-transform">
          <h2 className="text-gray-500 text-sm font-medium">Orders Placed</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">860</p>
        </div>

        {/* Average Purchase Value */}
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:scale-105 transition-transform">
          <h2 className="text-gray-500 text-sm font-medium">Avg. Purchase Value</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">$35.60</p>
        </div>

        {/* Top Supplier */}
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:scale-105 transition-transform">
          <h2 className="text-gray-500 text-sm font-medium">Top Supplier</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">Tech Supply Co.</p>
        </div>
      </div>

      {/* Purchase Table */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Purchases</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-gray-600">Purchase ID</th>
              <th className="p-3 text-gray-600">Supplier</th>
              <th className="p-3 text-gray-600">Product</th>
              <th className="p-3 text-gray-600">Amount</th>
              <th className="p-3 text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3">#P-2001</td>
              <td className="p-3">Global Tech</td>
              <td className="p-3">Laptops</td>
              <td className="p-3 text-blue-600 font-semibold">$5,000</td>
              <td className="p-3">2025-08-25</td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3">#P-2002</td>
              <td className="p-3">ElectroMart</td>
              <td className="p-3">Monitors</td>
              <td className="p-3 text-blue-600 font-semibold">$2,500</td>
              <td className="p-3">2025-08-24</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3">#P-2003</td>
              <td className="p-3">Tech Supply Co.</td>
              <td className="p-3">Headphones</td>
              <td className="p-3 text-blue-600 font-semibold">$1,200</td>
              <td className="p-3">2025-08-23</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchase;
