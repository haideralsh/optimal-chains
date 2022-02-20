const OptionsTableHead: React.FC = () => (
  <thead className="bg-gray-50">
    <tr>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        Symbol
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        Expiration
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        Strike
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        Bid
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        Percentage
      </th>
    </tr>
  </thead>
);

export default OptionsTableHead;
