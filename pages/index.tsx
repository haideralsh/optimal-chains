import type { NextPage } from "next";
import { useEffect, useState } from "react";
import OptionsTable from "../components/OptionsTable";

const Home: NextPage = () => {
  const [symbols, setSymbols] = useState("");

  const [data, setData] = useState<any>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    if (!formIsValid()) {
      setError("Please enter valid symbols.");
      return;
    }

    fetch("/api/chains/", {
      body: JSON.stringify({
        symbols: Array.from(getSymbolsSet()),
      }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => setError("An error has occurred."))
      .finally(() => setLoading(false));
  };

  const formIsValid = () => {
    const symbolsSet = getSymbolsSet();

    return symbolsSet.size > 0;
  };

  const getSymbolsSet = () => new Set(symbols?.split(",").map((s) => s.trim()));

  return (
    <main className="flex h-full w-full justify-center">
      <div className="flex flex-col mt-8 min-w-[500px]">
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
        {!isEmpty(data) ? (
          <OptionsTable symbolOptions={data} />
        ) : (
          <p>There are no option chains for {symbols}</p>
        )}
      </div>
    </main>
  );
};

const isEmpty = (obj: Record<any, any>) => Object.keys(obj).length === 0;

export default Home;
