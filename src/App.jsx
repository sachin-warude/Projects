import { useEffect, useState } from 'react';

// ``

export default function App() {
  const [fromCur, setFromCur] = useState('USD');
  const [toCur, setTOCur] = useState('USD');
  const [amount, setAmount] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!amount) return setOutput('');
    if (fromCur === toCur) return setOutput(amount);
    const controller = new AbortController();
    async function convertCurrency() {
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        console.log(data);
        setOutput(data.rates[toCur]);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
    convertCurrency();
    return () => controller.abort();
  }, [fromCur, toCur, amount]);
  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <select value={fromCur} onChange={e => setFromCur(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      <select value={toCur} onChange={e => setTOCur(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>

      {error && <p>{error}</p>}
      {!error && <p>{output}</p>}
    </div>
  );
}
