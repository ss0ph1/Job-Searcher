import React from "react";
import { TextInput } from "react-native";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (next: string) => void;
};

export default function DatePickerNative({ value, onChange }: Props) {
  // Simple fallback if you ever run native: type it in.
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      autoCapitalize="none"
      style={{
        borderWidth: 1,
        borderColor: "#E6E8EC",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
        fontSize: 14,
      }}
    />
  );
}
