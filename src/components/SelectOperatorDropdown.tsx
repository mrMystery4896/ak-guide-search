import { Operator } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { env } from "../env/client.mjs";
import Image from "next/image";
import React from "react";
import { translateRarityToClassName } from "../utils/functions";

interface SelectOperatorDropdownProps {
  operators: Operator[];
  setSelectedOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
  className?: string;
}

const SelectOperatorDropdown: React.FC<SelectOperatorDropdownProps> = ({
  operators,
  setSelectedOperators,
  className,
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
        <div className="relative w-64 max-w-[80vw]">
          <Combobox.Input
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className={twMerge(
              "w-full rounded-md border-2 border-gray-300 bg-gray-300 py-2 px-3 placeholder:text-gray-100 focus:border-primary focus:outline-none",
              className
            )}
            placeholder="Search for an operator"
          />
        </div>
        <Combobox.Options className="absolute z-10 max-h-52 w-64 max-w-[80vw] translate-y-1 overflow-auto rounded-md bg-gray-300 p-2 drop-shadow-lg">
          {filteredOperators.length !== 0 && query !== "" ? (
            filteredOperators.map((operator) => {
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
                      <div
                        className={`relative min-h-[40px] min-w-[40px] overflow-hidden rounded-full ${translateRarityToClassName(
                          operator.rarity
                        )}`}
                      >
                        <Image
                          src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                          alt={operator.id}
                          fill
                          sizes="100%"
                        />
                      </div>
                      <span className="truncate">{operator.name}</span>
                    </li>
                  )}
                </Combobox.Option>
              );
            })
          ) : (
            <Combobox.Option disabled value="">
              <p className="p-2 text-gray-100">No operators found</p>
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox>
    </>
  );
};

export default SelectOperatorDropdown;
