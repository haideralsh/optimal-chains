import type { NextPage } from "next";
import { useState } from "react";
import styled from "styled-components";

const Home: NextPage = () => {
  const [symbols, setSymbols] = useState("");
  const [result, setResult] = useState();

  const handleFind = async () => {
    fetch("/api/chains/", {
      body: JSON.stringify({ symbols: symbols.split(",") }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => setResult(data));
  };

  return (
    <Wrapper>
      <SearchWrapper>
        <SearchBox
          placeholder="Search for one or more stock symbol"
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
        />
        <Button onClick={handleFind}>Find</Button>
      </SearchWrapper>
      <p>{JSON.stringify(result)}</p>
    </Wrapper>
  );
};

const SearchWrapper = styled.div`
  display: flex;
`;

const Button = styled.button`
  color: #fff;
  background-color: #000;
  cursor: pointer;
  border: 1px solid #000;
  border-radius: 5px;
  padding: 10px 20px;
  margin: 5px;
  font-size: 1.2em;
`;

const SearchBox = styled.input`
  width: 450px;
  height: 30px;
  border: 1px solid #000;
  border-radius: 5px;
  padding: 10px;
  margin: 5px;
  font-size: 1.2em;
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default Home;
