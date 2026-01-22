import { useRef, useState } from 'react';
import React from 'react';

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  flexDirection: 'column',
  gap: '10px',
  fontSize: '24px',
};
export default function Ref() {
  const [output, setOutput] = useState('');
  const inputRef = useRef('');
  function handleClick() {
    setOutput(inputRef.current.value);
    inputRef.current.value = '';
  }
  return (
    <div style={style}>
      <div>
        <input ref={inputRef} />
        <button onClick={handleClick}>Add</button>
      </div>
      <p>{output}</p>
    </div>
  );
}
