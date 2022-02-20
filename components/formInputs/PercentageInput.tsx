type PercentageInput = {
  percentage: number;
  onPercentageChange: (percentage: number) => void;
};

const PercentageInput: React.FC<PercentageInput> = ({
  percentage,
  onPercentageChange,
}) => (
  <fieldset className="w-18 flex flex-col">
    <label htmlFor="percentage" className="pb-1 text-xs text-gray-500">
      Percentage
    </label>
    <div className="relative">
      <span className="absolute right-3 top-0 bottom-0 flex items-center text-sm text-gray-400">
        %
      </span>
      <input
        name="percentage"
        className="
        w-full
        rounded-r-full
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
        max={100}
        maxLength={3}
        min={1}
        type="number"
        value={percentage}
        onChange={(e) => onPercentageChange(Number(e.target.value))}
      />
    </div>
  </fieldset>
);

export default PercentageInput;
