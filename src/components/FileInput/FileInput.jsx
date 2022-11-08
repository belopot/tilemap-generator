import React, {useRef} from 'react';
import styled from 'styled-components';

export default function FileInput({
  onChange,
  className,
  placeholder = 'Load file',
  accept = 'application/json',
}) {
  const inputRef = useRef();
  const labelRef = useRef();
  return (
    <Holder className={className}>
      <input
        id="file-input"
        ref={inputRef}
        accept={accept}
        type="file"
        hidden
        onChange={e => {
          if (inputRef.current.files) {
            labelRef.current.innerHTML = inputRef.current.files['0'].name;
          } else {
            labelRef.current.innerHTML = placeholder;
          }
          onChange(e);
        }}
      />
      <Label ref={labelRef} htmlFor="file-input">
        {placeholder}
      </Label>
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  color: #fff;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 6px;
  transition: all 0.2s ease-out;
  &:hover {
    opacity: 0.8;
  }
`;

const Label = styled.label`
  padding: 0.8em 1em;
  width: 100%;
  text-align: center;
  cursor: pointer;
`;
