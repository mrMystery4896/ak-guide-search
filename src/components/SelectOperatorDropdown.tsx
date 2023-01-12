import { Operator } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { env } from "../env/client.mjs";
import Image from "next/image";
import React from "react";
import { translateRarityToClassName } from "../utils/functions";
import { AnimatePresence, motion } from "framer-motion";

interface SelectOperatorDropdownProps {
  operators: Operator[];
  setSelectedOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
  className?: string;
}

interface DropdownOptionsProps {
  open: boolean;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  operators: Operator[];
}

const DropdownOptions: React.FC<DropdownOptionsProps> = ({
  open,
  query,
  setQuery,
  operators,
}) => {
  const [filteredLength, setFilteredLength] = useState(10);

  useEffect(() => {
    if (!open) {
      setFilteredLength(10);
      setQuery("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <Combobox.Options
          onScroll={(e: React.UIEvent<HTMLElement>) => {
            const bottom =
              e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
              e.currentTarget.clientHeight;
            if (bottom) {
              setFilteredLength((prev) => prev + 10);
            }
          }}
          as={motion.ul}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          static
          className="absolute z-10 mt-1 max-h-52 w-64 max-w-[80vw] translate-y-1 overflow-auto rounded-md bg-gray-300 p-2 drop-shadow-lg"
        >
          {operators.filter((operator) => {
            return operator.name.toLowerCase().startsWith(query.toLowerCase());
          }).length > 0 ? (
            operators
              .filter((operator) => {
                return operator.name
                  .toLowerCase()
                  .startsWith(query.toLowerCase());
              })
              .slice(0, filteredLength)
              .map((operator) => {
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
                            width={40}
                            height={40}
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
              <p className="select-none p-2 text-gray-100">
                No operators found
              </p>
            </Combobox.Option>
          )}
        </Combobox.Options>
      )}
    </AnimatePresence>
  );
};

const SelectOperatorDropdown: React.FC<SelectOperatorDropdownProps> = ({
  operators,
  setSelectedOperators,
  className,
}) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selectedOperatorId) {
      const operatorToAdd = operators.find(
        (operator) => operator.id === selectedOperatorId
      );
      if (!operatorToAdd) return;
      setSelectedOperators((prev) => [...prev, operatorToAdd]);
      setQuery("");
      setSelectedOperatorId("");
    }
  }, [selectedOperatorId]);

  return (
    <>
      <Combobox value={selectedOperatorId} onChange={setSelectedOperatorId}>
        {({ open }) => {
          return (
            <>
              <div className="relative w-64 max-w-[80vw]">
                <Combobox.Button className="w-full">
                  <Combobox.Input
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                    className={twMerge(
                      "w-full rounded-md border-2 border-gray-300 bg-gray-300 py-2 px-3 placeholder:text-gray-100 focus:border-primary focus:outline-none",
                      className
                    )}
                    value={query}
                    placeholder="Search for an operator"
                  />
                </Combobox.Button>
              </div>
              <DropdownOptions
                open={open}
                query={query}
                setQuery={setQuery}
                operators={operators}
              />
            </>
          );
        }}
      </Combobox>
    </>
  );
};

export default SelectOperatorDropdown;
