import type { NextPage } from "next";
import { useState } from "react";
import styled from "styled-components";

const Home: NextPage = () => {
  const [symbols, setSymbols] = useState("");
  const [result, setResult] = useState<any>({});

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
      {Object.keys(result).length > 0 && (
        <table>
          <thead>
            <tr>
              <td>Symbol</td>
              <td>Expiration</td>
              <td>Strike</td>
              <td>Bid</td>
              <td>Percentage</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(result).map((symbol) => {
              return result[symbols]?.map((option: any) => (
                <tr key={option.expiration}>
                  <td>{symbol}</td>
                  <td>{option?.expiration}</td>
                  <td>{option?.strike}</td>
                  <td>{option?.bid}</td>
                  <td>{option?.percentage}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      )}
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
