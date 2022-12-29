import { Combobox } from "@headlessui/react";
import { Tag } from "@prisma/client";
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
  }, [selectedTagId]);

  return (
    <>
      <Combobox value={selectedTagId} onChange={setSelectedTagId}>
        <div className="relative w-44 md:w-64">
          <Combobox.Button className="w-full">
            <Combobox.Input
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              className={twMerge(
                "w-full rounded-md border border-gray-300 bg-gray-300 py-2 px-3 text-sm placeholder:text-sm placeholder:text-gray-100 focus:border focus:border-primary focus:outline-none md:text-base md:placeholder:text-base ",
                className
              )}
              placeholder="Search for a tag"
            />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 max-h-52 w-44 translate-y-1 overflow-auto rounded-md bg-gray-300 p-1 pr-2 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-500 scrollbar-track-rounded scrollbar-thumb-rounded-md md:w-64 md:p-2 md:pr-3">
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
                      } rounded-md p-1 text-sm md:p-2 md:text-base`}
                    >
                      {tag.name}
                    </li>
                  )}
                </Combobox.Option>
              );
            })
          ) : (
            <Combobox.Option disabled value="">
              <p className="p-1 text-sm text-gray-100 md:p-2 md:text-base">
                No tags found
              </p>
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox>
    </>
  );
};

export default SelectTagDropdown;