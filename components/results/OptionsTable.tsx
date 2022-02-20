import OptionsTableHead from "./OptionsTableHead";
import { isEmpty } from "../utils";

type Option = {
  expiration: string;
  strike: number;
  bid: number;
  percentage: number;
};

type OptionsTableProps = { symbolOptions: Record<string, Option[]> };

const OptionsTable: React.FC<OptionsTableProps> = ({ symbolOptions }) => {
  if (isEmpty(symbolOptions)) return null;

  return (
    <table className="mt-8 min-w-full divide-y divide-gray-200">
      <OptionsTableHead />
      <tbody className="divide-y divide-gray-200 bg-white text-sm">
        {Object.keys(symbolOptions).map((symbol) =>
          symbolOptions[symbol].map((option: Option) => (
            <tr
              key={`${symbol}-${option.expiration}-${option.strike}-${option.bid}`}
            >
              <td className="whitespace-nowrap px-6 py-4 uppercase text-gray-500">
                {symbol}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                {option.expiration}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-gray-500 ">
                ${option.strike.toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                ${option.bid.toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-500">
                {Math.floor(option.percentage)}%
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default OptionsTable;
