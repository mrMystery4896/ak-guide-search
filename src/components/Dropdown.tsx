import { Listbox } from "@headlessui/react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React from "react";
import { useEffect, useState } from "react";
import { BsCheck } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type DropdownProps<T> = {
  options: T[];
  selected: T | null;
  value?: T | null;
  onChange: (value: T | null) => void;
  disabled?: boolean;
  hasNullOption?: boolean;
  nullOptionText?: string;
  className?: string;
  optionsClassName?: string;
};

const chevronVariants: Variants = {
  up: {
    rotate: 180,
  },
  down: {
    rotate: 0,
  },
};

const Dropdown = <T extends number | string>({
  options,
  selected,
  onChange,
  disabled = false,
  hasNullOption = false,
  nullOptionText = "N/A",
  className = "",
  optionsClassName = "",
}: DropdownProps<T>) => {
  useEffect(() => {
    if (disabled) onChange(null);
  }, [disabled]);

  useEffect(() => {
    if (selected && !options.includes(selected)) onChange(options[0] ?? null);
  }, [options]);

  return (
    <Listbox
      as="div"
      className="relative"
      value={selected}
      onChange={onChange}
      disabled={disabled}
    >
      {({ disabled, open }) => (
        <>
          <Listbox.Button
            className={twMerge(
              `relative h-10 w-full rounded-md px-3 py-[10px] text-left md:h-11 md:w-32 ${
                disabled ? "bg-gray-300/50" : "bg-gray-300"
              }`,
              className
            )}
          >
            {({ value }) => (
              <>
                <p className={`${disabled ? "text-white/50" : ""} truncate`}>
                  {selected === null
                    ? hasNullOption
                      ? nullOptionText
                      : "Select an option"
                    : selected}
                </p>
                <motion.span
                  variants={chevronVariants}
                  animate={open ? "up" : "down"}
                  className="absolute right-0 top-0 mr-2 flex h-full items-center justify-center"
                >
                  <FaChevronDown />
                </motion.span>
              </>
            )}
          </Listbox.Button>
          <AnimatePresence>
            {open && (
              <Listbox.Options
                as={motion.ul}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className={twMerge(
                  "absolute mt-1 max-h-52 w-32 overflow-y-auto rounded-md bg-gray-300 p-2 drop-shadow-lg",
                  optionsClassName
                )}
                static
              >
                {hasNullOption && (
                  <Listbox.Option as={React.Fragment} key="null" value={null}>
                    {({ active, selected }) => (
                      <li
                        className={`${
                          active ? "bg-primary" : ""
                        } flex h-10 cursor-pointer items-center justify-between rounded-md p-2`}
                      >
                        {nullOptionText}
                        {selected && <BsCheck className="h-6 w-6" />}
                      </li>
                    )}
                  </Listbox.Option>
                )}
                {options.map((option) => (
                  <Listbox.Option
                    as={React.Fragment}
                    key={option}
                    value={option}
                  >
                    {({ active, selected }) => (
                      <li
                        className={`${
                          active ? "bg-primary" : ""
                        } flex h-10 cursor-pointer items-center justify-between truncate rounded-md p-2`}
                      >
                        {option}
                        {selected && <BsCheck className="h-6 w-6" />}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </AnimatePresence>
        </>
      )}
    </Listbox>
  );
};

export default Dropdown;
