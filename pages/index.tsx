import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [message, setMessage] = useState("");

  const handleHiButtonClick = async () => {
    fetch("/api/chains")
      .then((res) => res.json())
      .then((data) => JSON.parse(data.body))
      .then((body) => setMessage(body.message));
  };

  return (
    <>
      <button onClick={handleHiButtonClick}>Find</button>
      <p>{message}</p>
    </>
  );
};

export default Home;
