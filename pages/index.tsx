import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [symbols, setSymbols] = useState("");

  const [data, setData] = useState<any>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const symbols = formData.get("symbols");
    const percentage = formData.get("percentage");

    if (symbols && typeof symbols === "string") {
      setLoading(true);

      fetch("/api/chains/", {
        body: JSON.stringify({
          symbols: symbols?.split(",").map((s) => s.trim()),
          percentage: Number(percentage),
        }),
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch(() => setError("An error has occurred."))
        .finally(() => setLoading(false));
    } else {
      setError("Please enter valid symbols.");
    }
  };

  return (
    <main className="flex justify-center min-w-[500px]">
      <div className="flex flex-col mt-8">
        <h1 className="text-2xl mb-6 text-gray-600">Optimal Chains</h1>
        <form
          className="flex gap-4 items-end"
          name="optimal-chains"
          onSubmit={handleSubmit}
        >
          <div className="flex items-end gap-0.5">
            <fieldset className="flex flex-col w-72">
              <label htmlFor="symbols" className="text-gray-500 text-sm pb-2">
                Enter one or more symbols
              </label>
              <input
                name="symbols"
                className="bg-gray-100 focus:bg-gray-200 outline-none text-gray-700 uppercase p-1 px-3 rounded-l-full text-sm placeholder:text-gray-400 placeholder:text-sm placeholder:normal-case placeholder:font-sans"
                maxLength={25}
                placeholder="Example: AAPL, SPY, TSLA"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
              />
            </fieldset>
            <fieldset className="flex flex-col w-18">
              <label
                htmlFor="percentage"
                className="text-gray-500 text-sm pb-2"
              >
                Percentage
              </label>
              <div className="relative">
                <span className="absolute flex items-center right-3 text-sm text-gray-400 top-0 bottom-0">
                  %
                </span>
                <input
                  name="percentage"
                  className="w-full bg-gray-100 focus:bg-gray-200 text-gray-700 outline-none uppercase p-1 px-3 rounded-r-full text-sm placeholder:text-gray-400 placeholder:text-sm placeholder:normal-case placeholder:font-sans"
                  max={100}
                  maxLength={3}
                  min={0}
                  defaultValue="12"
                  type="number"
                />
              </div>
            </fieldset>
          </div>
          <button
            disabled={symbols.length === 0 || loading}
            className="bg-teal-700 rounded-full text-white py-1 px-6 text-sm disabled:bg-gray-300 disabled:text-gray-400 "
          >
            {loading ? "Loading..." : "Find"}
          </button>
        </form>
        {Object.keys(data).length > 0 && (
          <table className="min-w-full divide-y divide-gray-200 mt-8">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Symbol
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expiration
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Strike
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Bid
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Percentage
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {Object.keys(data).map((symbol) =>
                data[symbol]?.map((option: any) => (
                  <tr key={`${symbol}-${option.expiration}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 uppercase">
                      {symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {option.expiration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-right ">
                      ${option.strike}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      ${option.bid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                      {Math.floor(option.percentage)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default Home;
