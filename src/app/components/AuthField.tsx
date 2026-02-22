"use client";

import type React from "react";

type Props = {
  label: string;
  icon?: React.ReactNode;

  value: string;
  onChange: (v: string) => void;

  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;

  disabled?: boolean;
  required?: boolean;
 
  name?: string;
  id?: string;
};

export default function AuthField({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  required,
  name,
  id,
}: Props) {
  const inputId = id ?? name;

  return (
    <label className="field" htmlFor={inputId}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <div className="input">
        {icon}
        <input
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          type={type}
          disabled={disabled}
        />
      </div>
    </label>
  );
}