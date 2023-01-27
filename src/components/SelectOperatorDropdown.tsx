import type { Operator } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { env } from "../env/client.mjs";
import Image from "next/image";
import React from "react";
import { translateRarityToClassName } from "../utils/functions";
import { AnimatePresence, motion } from "framer-motion";
import { BiX } from "react-icons/bi";
import { BsCheck } from "react-icons/bs";
import { FixedSizeList } from "react-window";

interface SelectOperatorDropdownProps {
  operators: Operator[];
  activeOperator: Operator | null;
  setActiveOperator: React.Dispatch<React.SetStateAction<Operator | null>>;
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
  const [filteredOperators, setFilteredOperators] =
    useState<Operator[]>(operators);

  const listRef = React.createRef<FixedSizeList<Operator[]>>();

  useEffect(() => {
    setFilteredOperators(operators);
  }, [operators]);

  useEffect(() => {
    setFilteredOperators(
      operators.filter((operator) => {
        return operator.name.toLowerCase().startsWith(query.toLowerCase());
      })
    );
  }, [query, operators]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    } else {
      const index = operators.findIndex(
        (operator) => operator.id === activeOperator?.id
      );
      if (index > 0) {
        listRef.current?.scrollToItem(index, "center");
      }
    }
  }, [open, activeOperator, listRef, operators, setQuery]);

  return (
    <AnimatePresence>
      {open && (
        <Combobox.Options
          as={motion.ul}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          static
          className="absolute z-10 mt-1 max-h-52 w-full translate-y-1 overflow-auto rounded-md bg-gray-300 drop-shadow-lg md:w-64"
        >
          {filteredOperators.length > 0 ? (
            <FixedSizeList
              height={Math.min(208, filteredOperators.length * 48 + 18)}
              width="100%"
              itemCount={filteredOperators.length}
              itemSize={48}
              itemData={filteredOperators}
              itemKey={(index, data) => {
                const operator: Operator = data[index] as Operator;
                return operator.id;
              }}
              ref={listRef}
            >
              {Row}
            </FixedSizeList>
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

const Row = ({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: Operator[];
}) => {
  const operator: Operator = data[index] as Operator;

  return (
    <Combobox.Option value={operator} style={style}>
      {({ active, selected }) => (
        <div
          className={`m-2 flex cursor-pointer items-center gap-4 rounded-md p-1 py-2 ${
            active ? "bg-primary" : ""
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
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
              <span className="truncate" spellCheck={false}>
                {operator.name}
              </span>
            </div>
            {selected && <BsCheck className="h-6 w-6" />}
          </div>
        </div>
      )}
    </Combobox.Option>
  );
};

const SelectOperatorDropdown: React.FC<SelectOperatorDropdownProps> = ({
  operators,
  activeOperator,
  setActiveOperator,
  className,
}) => {
  const [query, setQuery] = useState("");

  return (
    <>
      <Combobox value={activeOperator} onChange={setActiveOperator} nullable>
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
                    displayValue={(operator: Operator | null) =>
                      operator?.name ?? ""
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
                    setActiveOperator(null);
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
