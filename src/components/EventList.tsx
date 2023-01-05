import { Disclosure } from "@headlessui/react";
import { Variants, motion, AnimatePresence } from "framer-motion";
import React from "react";
import { Dispatch, SetStateAction } from "react";
import { FaChevronDown } from "react-icons/fa";
import { EventWithChildren } from "../utils/common-types";
import Button from "./Button";
import { RiMenuAddFill } from "react-icons/ri";
import { BsFillTrashFill } from "react-icons/bs";

interface EventListProps {
  eventList: EventWithChildren[];
  className?: string;
  setModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      title: string;
      parentEventId: string;
    }>
  >;
}

const chevronVariants: Variants = {
  up: {
    rotate: 180,
  },
  down: {
    rotate: 0,
  },
};

const EventList: React.FC<EventListProps> = ({
  eventList,
  className,
  setModalState,
}) => {
  return (
    <div className="flex flex-col">
      {eventList.map((event) => {
        return (
          <React.Fragment key={event.id}>
            <Disclosure>
              {({ open }) => {
                return (
                  <>
                    <div className="mt-2 flex w-auto gap-2">
                      <Disclosure.Button className="relative w-full max-w-[calc(100%-48px-48px)] rounded-md bg-gray-300">
                        <p className="truncate p-2 px-6 font-bold">
                          {event.name}
                        </p>
                        <motion.div
                          className="absolute right-2 top-0 flex h-full items-center justify-center"
                          variants={chevronVariants}
                          animate={open ? "up" : "down"}
                        >
                          <FaChevronDown />
                        </motion.div>
                      </Disclosure.Button>
                      {event.stages.length === 0 && (
                        <Button
                          className="h-10 max-h-full w-10"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Add a category under ${event.name}`,
                              parentEventId: event.id,
                            });
                          }}
                        >
                          <RiMenuAddFill />
                        </Button>
                      )}
                      <Button className="h-10 max-h-full bg-red">
                        <BsFillTrashFill />
                      </Button>
                    </div>
                    <AnimatePresence>
                      {open && (
                        <Disclosure.Panel
                          className={className + " mr-8 overflow-hidden"}
                          as={motion.div}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          static
                        >
                          <EventList
                            eventList={event.childEvents || []}
                            setModalState={setModalState}
                          />
                          {event.stages && !event.childEvents && (
                            <>
                              {event.stages.map((stage) => (
                                <div
                                  key={stage.stageCode}
                                  className="mt-2 max-w-[calc(100%-80px)] rounded-md bg-gray-300 p-2 text-center font-bold"
                                >
                                  {stage.stageCode}
                                </div>
                              ))}
                              <Button className="mt-2 w-[calc(100%-80px)] py-2">
                                Add Stage
                              </Button>
                            </>
                          )}
                        </Disclosure.Panel>
                      )}
                    </AnimatePresence>
                  </>
                );
              }}
            </Disclosure>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default EventList;
