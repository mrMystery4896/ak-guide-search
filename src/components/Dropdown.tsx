import { Listbox } from "@headlessui/react";
import type { Variants } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useEffect } from "react";
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
  onChange: onChangeHandler,
  disabled = false,
  hasNullOption = false,
  nullOptionText = "N/A",
  className = "",
  optionsClassName = "",
}: DropdownProps<T>) => {
  // if the component is disabled, set the selected option to null
  useEffect(() => {
    if (disabled) onChangeHandler(null);
    // onChangeHandler cannot be added to the dependency array because it will cause an infinite loop, usecallback does not work
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]); //

  // If the selected option is not in the options array, set the selected option to the first option in the array (or null if there are no options)
  useEffect(() => {
    if (selected && !options.includes(selected))
      onChangeHandler(options[0] ?? null);
  }, [options, selected, onChangeHandler]);

  return (
    <Listbox
      as="div"
      className="relative"
      value={selected}
      onChange={onChangeHandler}
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
            {() => (
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
