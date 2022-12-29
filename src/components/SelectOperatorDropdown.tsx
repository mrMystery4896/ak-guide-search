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
        <div className="relative w-44 md:w-64">
          <Combobox.Input
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className={twMerge(
              "w-full rounded-md border border-gray-300 bg-gray-300 py-2 px-3 text-sm placeholder:text-sm placeholder:text-gray-100 focus:border focus:border-primary focus:outline-none md:text-base md:placeholder:text-base ",
              className
            )}
            placeholder="Search for an operator"
          />
        </div>
        <Combobox.Options className="absolute z-10 max-h-52 w-44 translate-y-1 overflow-auto rounded-md bg-gray-300 p-1 pr-2 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-500 scrollbar-track-rounded scrollbar-thumb-rounded-md md:w-64 md:p-2 md:pr-3">
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
                      } flex h-10 cursor-pointer items-center gap-2 rounded-md p-1 md:h-14 md:gap-4 md:p-2`}
                    >
                      <div
                        className={`relative h-6 w-6 overflow-hidden rounded-full md:h-10 md:w-10 ${translateRarityToClassName(
                          operator.rarity
                        )}`}
                      >
                        <Image
                          src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                          alt={operator.id}
                          fill
                        />
                      </div>
                      <span>{operator.name}</span>
                    </li>
                  )}
                </Combobox.Option>
              );
            })
          ) : (
            <Combobox.Option disabled value="">
              <p className="text-gray-100">No operators found</p>
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox>
    </>
  );
};

export default SelectOperatorDropdown;
