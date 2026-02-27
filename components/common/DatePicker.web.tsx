import React from "react";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (next: string) => void;
};

export default function DatePickerWeb({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        border: "1px solid #E6E8EC",
        borderRadius: 12,
        padding: "10px 12px",
        fontSize: 14,
        backgroundColor: "#fff",
        boxSizing: "border-box",
      }}
    />
  );
}
