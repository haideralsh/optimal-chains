type SymbolsSearchboxProps = {
  symbols: string;
  onSymbolsChange: (symbols: string) => void;
};

const SymbolsSearchbox: React.FC<SymbolsSearchboxProps> = ({
  symbols,
  onSymbolsChange,
}) => (
  <fieldset className="flex w-72 flex-col">
    <label htmlFor="symbols" className="pb-1 text-xs text-gray-500">
      Enter one or more symbols
    </label>
    <input
      name="symbols"
      className="
        rounded-l-full
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
        focus:bg-gray-200
        "
      maxLength={25}
      placeholder="Example: AAPL, SPY, TSLA"
      value={symbols}
      onChange={(e) => onSymbolsChange(e.target.value)}
    />
  </fieldset>
);

export default SymbolsSearchbox;
