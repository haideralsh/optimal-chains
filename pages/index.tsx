import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [symbol, setSymbol] = useState("");
  const [result, setResult] = useState();

  const handleHiButtonClick = async () => {
    fetch("/api/chains")
      .then((res) => res.json())
      .then((data) => JSON.parse(data.body))
      .then((body) => setResult(body.message));
  };

  return (
    <>
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      <button onClick={handleHiButtonClick}>Find</button>
      <p>{JSON.stringify(result)}</p>
    </>
  );
};

export default Home;
