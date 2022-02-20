import OptionsTable from "./OptionsTable";

type ResultsProps = {
  data: Record<any, any>;
  error: string;
};

const Results: React.FC<ResultsProps> = ({ data, error }) => {
  if (error) return <p className="mt-8 text-xs text-gray-500">{error}</p>;

  if (data) return <OptionsTable symbolOptions={data} />;

  return null;
};

export default Results;
