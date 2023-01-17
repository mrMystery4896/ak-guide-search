import { Operator } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { env } from "../env/client.mjs";
import Image from "next/image";
import React from "react";
import { translateRarityToClassName } from "../utils/functions";
import { AnimatePresence, motion } from "framer-motion";
import { BiX } from "react-icons/bi";

interface SelectOperatorDropdownProps {
  operators: Operator[];
  activeOperator: Operator | null;
  handleSelectOperator: (operator: Operator | null) => void;
  className?: string;
}

interface DropdownOptionsProps {
  open: boolean;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  operators: Operator[];
  activeOperator: Operator | null;
}

const DropdownOptions: React.FC<DropdownOptionsProps> = ({
  open,
  query,
  setQuery,
  operators,
  activeOperator,
}) => {
  const [filteredLength, setFilteredLength] = useState(10);

  useEffect(() => {
    if (!open) {
      setFilteredLength(10);
      setQuery("");
    } else {
      const index = operators.findIndex(
        (operator) => operator.id === activeOperator?.id
      );
      if (index > 0) {
        setFilteredLength(index + 10);
      }
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
          className="absolute z-10 mt-1 max-h-52 w-64 translate-y-1 overflow-auto rounded-md bg-gray-300 p-2 drop-shadow-lg"
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
                    {({ active, selected }) => (
                      <li
                        className={`${
                          active || selected ? "bg-primary" : ""
                        } flex h-12 cursor-pointer items-center gap-4 rounded-md p-2`}
                      >
                        <div
                          className={`relative min-h-[32px] min-w-[32px] overflow-hidden rounded-full ${translateRarityToClassName(
                            operator.rarity
                          )}`}
                        >
                          <Image
                            src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                            alt={operator.id}
                            width={32}
                            height={32}
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
  handleSelectOperator,
  activeOperator,
  className,
}) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selectedOperatorId) {
      const operatorToAdd = operators.find(
        (operator) => operator.id === selectedOperatorId
      );
      handleSelectOperator(operatorToAdd ?? null);
    } else handleSelectOperator(null);
  }, [selectedOperatorId]);

  return (
    <>
      <Combobox value={selectedOperatorId} onChange={setSelectedOperatorId}>
        {({ open }) => {
          return (
            <div className="relative">
              <div className="relative w-full md:w-64">
                {activeOperator && (
                  <div
                    className={`absolute top-1/2 left-2 min-h-[32px] min-w-[32px] -translate-y-1/2 overflow-hidden rounded-full ${translateRarityToClassName(
                      activeOperator.rarity
                    )}`}
                  >
                    <Image
                      src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${activeOperator.id}.png`}
                      alt={activeOperator.id}
                      width={32}
                      height={32}
                    />
                  </div>
                )}
                <Combobox.Button className="w-full">
                  <Combobox.Input
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                    className={twMerge(
                      `w-full rounded-md border-2 border-gray-300 bg-gray-300 py-2 px-3 ${
                        activeOperator ? "pl-12" : "pl-3"
                      } placeholder:text-gray-100 focus:border-primary focus:outline-none`,
                      className
                    )}
                    displayValue={() =>
                      activeOperator ? activeOperator.name : ""
                    }
                    placeholder="Search for an operator"
                  />
                </Combobox.Button>
                <button
                  type="button"
                  className={`absolute right-0 top-0 h-full ${
                    activeOperator ? "" : "hidden"
                  }`}
                  onClick={() => {
                    setSelectedOperatorId("");
                  }}
                >
                  <BiX className="mr-1 h-6 w-6" />
                </button>
              </div>
              <DropdownOptions
                open={open}
                query={query}
                setQuery={setQuery}
                operators={operators}
                activeOperator={activeOperator}
              />
            </div>
          );
        }}
      </Combobox>
    </>
  );
};

export default SelectOperatorDropdown;
