import { useMemo, useState } from "react"
import Image from "next/image"
import type { NextPage } from "next"
import OptionsTable from "../components/results/OptionsTable"
import PercentageInput from "../components/formInputs/PercentageInput"
import SymbolsSearchbox from "../components/formInputs/SymbolsSearchbox"
import { isEmpty } from "../components/utils"
import Results from "../components/results/Result"

export const inDev = process.env.NODE_ENV === "development"

const API_ENDPOINT = inDev
  ? "https://optimal-chains.vercel.app/api/chains"
  : "/api/chains/"

const Home: NextPage = () => {
  const [symbols, setSymbols] = useState("")
  const [percentage, setPercentage] = useState(12)

  const [data, setData] = useState<any>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setData({})
    setError("")
    setLoading(true)
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    reset()

    if (!isFormValid()) {
      setError("Please enter valid symbols.")
      return
    }

    fetch(API_ENDPOINT, {
      body: JSON.stringify({
        symbols: Array.from(symbolsSet),
        percentage,
      }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data)

        if (isEmpty(data))
          setError(`No options were found for ${symbols.toUpperCase()}`)
      })
      .catch(() => setError("An error has occurred"))
      .finally(() => setLoading(false))
  }

  const isFormValid = () => symbolsSet.size > 0

  const symbolsSet = useMemo(
    () => new Set(symbols?.split(",").map((s) => s.trim())),
    [symbols]
  )

  const disableSubmit = useMemo(
    () => () => symbols.trim().length === 0 || percentage <= 0 || loading,
    [symbols, percentage, loading]
  )

  return (
    <main className="flex h-full w-full justify-center">
      <div className="mt-8 flex min-w-[580px] flex-col">
        <div className="mb-8">
          <Image src="/logo.svg" alt="app logo" width={138} height={60} />
        </div>
        <form
          className="flex items-end gap-4"
          name="optimal-chains"
          onSubmit={handleSubmit}
        >
          <div className="flex items-end gap-0.5">
            <SymbolsSearchbox symbols={symbols} setSymbols={setSymbols} />
            <PercentageInput
              percentage={percentage}
              onPercentageChange={setPercentage}
            />
          </div>
          <button
            disabled={disableSubmit()}
            className="rounded-full bg-teal-700 py-1 px-6 text-sm text-white disabled:bg-gray-300 disabled:text-gray-400"
          >
            {loading ? "Loading..." : "Find"}
          </button>
        </form>

        <Results data={data} error={error} />
      </div>
    </main>
  )
}

export default Home
