import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [symbol, setSymbol] = useState("");
  const [result, setResult] = useState();

  const handleFind = async () => {
    fetch("/api/chains/", { body: JSON.stringify({ symbol }), method: "POST" })
      .then((res) => res.json())
      .then((data) => JSON.parse(data.body))
      .then((body) => setResult(body.message));
  };

  return (
    <>
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      <button onClick={handleFind}>Find</button>
      <p>{JSON.stringify(result)}</p>
    </>
  );
};

export default Home;
