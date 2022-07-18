import { ChangeEvent, Fragment, useState } from "react"
import { Combobox } from "@headlessui/react"
import { useDebouncedCallback } from "use-debounce"

type SymbolsSearchboxProps = {
  symbols: string
  setSymbols: any
}

type SymbolsApiResponse = {
  securities: null | {
    security: Array<Record<string, any>> | Record<string, any>
  }
}

type SymbolsDetails = {
  symbol: string
  exchange: string
  type: string
  description: string
}

const MAX_OPTIONS = 5

const SymbolsSearchbox: React.FC<SymbolsSearchboxProps> = ({
  setSymbols,
  symbols,
}) => {
  const [query, setQuery] = useState("")
  const [queryResults, setQueryResults] = useState([])

  function updateQueryResults() {
    fetch(`https://optimal-chains.vercel.app/api/symbols?q=${query}`)
      .then((res) => res.json())
      .then((res) => {
        setQueryResults(res.symbols)
      })
  }

  const debouncedFetch = useDebouncedCallback(
    () => {
      updateQueryResults()
    },
    300,
    { maxWait: 2000 }
  )

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const queryValue = event.target.value
    setQuery(event.target.value)

    if (!queryValue) {
      setQueryResults([])
      return
    }

    debouncedFetch()
  }

  return (
    <div className="relative flex w-72 flex-col">
      <Combobox as="div" value={symbols} onChange={setSymbols}>
        {({ open }) => (
          <>
            <Combobox.Label className="pb-1 text-xs text-gray-500">
              Symbol
            </Combobox.Label>
            <Combobox.Input
              className={`
              w-full
              ${
                query && queryResults.length && open
                  ? "rounded-tl-lg"
                  : "rounded-l-lg"
              }          
              bg-gray-100
              p-1
              px-3
              text-sm
              uppercase
              text-gray-700
              outline-none
              placeholder:font-sans
              placeholder:text-sm
              placeholder:normal-case 
              placeholder:text-gray-400 
              focus:bg-gray-200`}
              placeholder="Enter a symbol..."
              value={query}
              onChange={handleQueryChange}
            />
            <Combobox.Options className="absolute left-0 right-0 mt-0.5 rounded-b-lg border-solid bg-gray-200">
              {queryResults.map(
                (details: SymbolsDetails, index) =>
                  index < MAX_OPTIONS && (
                    <Combobox.Option
                      key={details.symbol}
                      value={details.symbol}
                      as={Fragment}
                    >
                      {({ active }) => (
                        <li
                          className={`
                        py-2
                        px-3
                        text-sm
                        last:rounded-b-lg
                        ${
                          active
                            ? "bg-teal-700 text-gray-50"
                            : "transparent text-gray-700"
                        }`}
                        >
                          <span className="block uppercase ">
                            {details.symbol}
                          </span>

                          <span>{details.description}</span>
                        </li>
                      )}
                    </Combobox.Option>
                  )
              )}
            </Combobox.Options>
          </>
        )}
      </Combobox>
    </div>
  )
}

export default SymbolsSearchbox
