import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import OptionsTable from "../components/OptionsTable";

export const isEmpty = (obj: Record<any, any>) => Object.keys(obj).length === 0;

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

    fetch("https://optimal-chains.vercel.app/api/chains", {
      body: JSON.stringify({
        symbols: Array.from(getSymbolsSet()),
      }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);

        if (isEmpty(data))
          setError(`No options found were found for ${symbols}`);
      })
      .catch(() => setError("An error has occurred"))
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
        <div className="mb-8">
          <Image src="/logo.svg" alt="app logo" width={115} height={58} />
        </div>
        <form
          className="flex gap-4 items-end"
          name="optimal-chains"
          onSubmit={handleSubmit}
        >
          <div className="flex items-end gap-0.5">
            <fieldset className="flex flex-col w-72">
              <label htmlFor="symbols" className="text-gray-500 text-xs pb-1">
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
                className="text-gray-500 text-xs pb-1"
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
            disabled={symbols.trim().length === 0 || loading}
            className="bg-teal-700 rounded-full text-white py-1 px-6 text-sm disabled:bg-gray-300 disabled:text-gray-400 "
          >
            {loading ? "Loading..." : "Find"}
          </button>
        </form>

        {error ? (
          <p className="text-xs text-gray-500 mt-8">{error}</p>
        ) : (
          <OptionsTable symbolOptions={data} />
        )}
      </div>
    </main>
  );
};

export default Home;
