import { Operator } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { env } from "../env/client.mjs";
import Image from "next/image";
import React from "react";
import { translateRarityToClassName } from "../utils/functions";

interface SelectOperatorDropdownProps {
  operators: Operator[];
  setSelectedOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
}

const SelectOperatorDropdown: React.FC<SelectOperatorDropdownProps> = ({
  operators,
  setSelectedOperators,
}) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [query, setQuery] = useState("");

  const filteredOperators = operators.filter((operator) => {
    return operator.name.toLowerCase().startsWith(query.toLowerCase());
  });

  useEffect(() => {
    if (selectedOperatorId) {
      setSelectedOperators((prev) => [
        ...prev,
        operators.find(
          (operator) => operator.id === selectedOperatorId
        ) as Operator,
      ]);
      setSelectedOperatorId("");
      setQuery("");
    }
  }, [selectedOperatorId]);

  return (
    <>
      <Combobox value={selectedOperatorId} onChange={setSelectedOperatorId}>
        <div className="relative w-64">
          <Combobox.Button className="w-full">
            {({ open }) => (
              <>
                <Combobox.Input
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  className="w-full rounded-md border border-gray-300 bg-gray-300 py-2 px-3 placeholder:text-gray-100 focus:border focus:border-primary focus:outline-none"
                  placeholder="Select an operator"
                />
                <FaChevronDown
                  className={`${
                    open ? "rotate-180" : ""
                  } absolute right-0 top-0 mr-2 h-full`}
                />
              </>
            )}
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 max-h-52 w-64 translate-y-1 overflow-auto rounded-md bg-gray-300 p-2 pr-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
          {filteredOperators.map((operator) => {
            return (
              <Combobox.Option
                as={React.Fragment}
                key={operator.id}
                value={operator.id}
              >
                {({ active }) => (
                  <li
                    className={`${
                      active ? "bg-primary" : ""
                    } flex h-14 cursor-pointer items-center gap-4 rounded-md p-2`}
                  >
                    <Image
                      src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                      alt={operator.id}
                      height={40}
                      width={40}
                      style={{ borderRadius: "50%" }}
                      className={translateRarityToClassName(operator.rarity)}
                    />
                    <span>{operator.name}</span>
                  </li>
                )}
              </Combobox.Option>
            );
          })}
        </Combobox.Options>
      </Combobox>
    </>
  );
};

export default SelectOperatorDropdown;
