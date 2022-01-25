import { isEmpty } from "../pages";

type Option = {
  expiration: string;
  strike: number;
  bid: number;
  percentage: number;
};

type OptionsTableProps = { symbolOptions: Record<string, Option[]> };

const OptionsTableHead: React.FC = () => (
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
);

const OptionsTable: React.FC<OptionsTableProps> = ({ symbolOptions }) => {
  if (isEmpty(symbolOptions)) return null;

  return (
    <table className="min-w-full divide-y divide-gray-200 mt-8">
      <OptionsTableHead />
      <tbody className="bg-white divide-y divide-gray-200 text-sm">
        {Object.keys(symbolOptions).map((symbol) =>
          symbolOptions[symbol].map((option: any) => (
            <tr
              key={`${symbol}-${option.expiration}-${option.strike}-${option.bid}`}
            >
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
  );
};

export default OptionsTable;
