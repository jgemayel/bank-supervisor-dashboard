import { useState } from "react";
import { banks } from "../data/banks";

export function useSelectedBank() {
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  const selectedBank = selectedBankId
    ? banks.find((b) => b.id === selectedBankId) || null
    : null;

  return { selectedBank, selectedBankId, setSelectedBankId };
}
