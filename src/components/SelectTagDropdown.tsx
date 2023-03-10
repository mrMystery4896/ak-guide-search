import { Combobox } from "@headlessui/react";
import type { Tag } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface SelectTagDropdownProps {
  tags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  className?: string;
}

const SelectTagDropdown: React.FC<SelectTagDropdownProps> = ({
  tags,
  setSelectedTags,
  className,
}) => {
  const [selectedTagId, setSelectedTagId] = useState("");
  const [query, setQuery] = useState("");

  const filteredTags = tags.filter((tag) => {
    return tag.name.toLowerCase().startsWith(query.toLowerCase());
  });

  useEffect(() => {
    if (selectedTagId) {
      setSelectedTags((prev) => [
        ...prev,
        tags.find((tag) => tag.id === selectedTagId) as Tag,
      ]);
      setSelectedTagId("");
      setQuery("");
    }
  }, [selectedTagId, setSelectedTags, tags]);

  return (
    <>
      <Combobox value={selectedTagId} onChange={setSelectedTagId}>
        {({ open }) => (
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
                  placeholder="Search for a tag"
                />
              </Combobox.Button>
            </div>
            <AnimatePresence>
              {open && (
                <Combobox.Options
                  as={motion.ul}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  static
                  className="absolute z-10 mt-1 max-h-52 w-64 max-w-[80vw] translate-y-1 overflow-auto rounded-md bg-gray-300 p-2 drop-shadow-lg"
                >
                  {filteredTags.length !== 0 ? (
                    filteredTags.map((tag) => {
                      return (
                        <Combobox.Option
                          as={React.Fragment}
                          key={tag.id}
                          value={tag.id}
                        >
                          {({ active }) => (
                            <li
                              className={`${
                                active ? "bg-primary" : ""
                              } flex h-12 cursor-pointer items-center rounded-md p-2`}
                            >
                              {tag.name}
                            </li>
                          )}
                        </Combobox.Option>
                      );
                    })
                  ) : (
                    <Combobox.Option disabled value="">
                      <p className="p-2 text-gray-100">No tags found</p>
                    </Combobox.Option>
                  )}
                </Combobox.Options>
              )}
            </AnimatePresence>
          </>
        )}
      </Combobox>
    </>
  );
};

export default SelectTagDropdown;
