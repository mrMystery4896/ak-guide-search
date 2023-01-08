import { Disclosure, Menu } from "@headlessui/react";
import { Variants, motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { FaChevronDown } from "react-icons/fa";
import { EventWithChildren } from "../utils/common-types";
import { RiMenuAddFill } from "react-icons/ri";
import { BsFillTrashFill, BsThreeDotsVertical } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { Stage } from "@prisma/client";
import { TiPlus } from "react-icons/ti";
import { BiMove } from "react-icons/bi";

interface EventListProps {
  eventList: EventWithChildren[];
  className?: string;
  setAddEventModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      title: string;
      parentEventId: string;
    }>
  >;
  setAddStageModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      event?: EventWithChildren;
    }>
  >;
  setEditModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      event?: EventWithChildren;
      stage?: Stage;
    }>
  >;
  setDeleteModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      event?: EventWithChildren;
      stage?: Stage;
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
  setAddEventModalState,
  setAddStageModalState,
  setEditModalState,
  setDeleteModalState,
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const eventContainers: any = document.querySelectorAll("#eventContainer");
      for (let i = 0; i < eventContainers.length; i++) {
        if (eventContainers[i]) {
          for (let j = 0; j < eventContainers[i]?.children?.length; j++) {
            eventContainers[i].children[j].style.zIndex = `-${j}`;
          }
        }
      }
    }
  });

  return (
    <div
      className="relative z-0 flex flex-col"
      id="eventContainer"
      ref={divRef}
    >
      {eventList.map((event) => {
        return (
          <React.Fragment key={event.id}>
            <Disclosure>
              {({ open }) => {
                return (
                  <>
                    <div className="relative mt-2 flex w-auto gap-2">
                      <Disclosure.Button
                        className={`relative w-full max-w-[calc(100%-48px)] rounded-md bg-gray-300 ${
                          event.stages.length > 0 || event?.childEvents?.length
                            ? "cursor-pointer"
                            : "pointer-events-none cursor-default"
                        }`}
                      >
                        <p className="truncate p-2 px-6 font-bold">
                          {event.name}
                        </p>
                        {(event.stages.length > 0 ||
                          event?.childEvents?.length) && (
                          <motion.div
                            className={`absolute right-2 top-0 flex h-full items-center justify-center`}
                            variants={chevronVariants}
                            animate={open ? "up" : "down"}
                          >
                            <FaChevronDown />
                          </motion.div>
                        )}
                      </Disclosure.Button>
                      <Menu>
                        {({ open }) => (
                          <>
                            <Menu.Button className="relative z-10 flex h-10 max-h-full w-10 items-center justify-center rounded-md bg-primary focus:outline-none">
                              <BsThreeDotsVertical />
                            </Menu.Button>
                            <AnimatePresence>
                              {open && (
                                <Menu.Items
                                  static
                                  as={motion.div}
                                  initial={{
                                    opacity: 0,
                                    y: 10,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    y: 10,
                                  }}
                                  className="absolute top-10 right-0 z-50 rounded-md border border-gray-500 bg-gray-300 p-1 shadow-2xl shadow-gray-800 overflow-y-hidden focus:outline-none"
                                  role="menu"
                                  aria-labelledby="options-menu"
                                >
                                  {event.stages.length === 0 ? (
                                    <Menu.Item
                                      disabled={event.stages.length > 0}
                                    >
                                      {({ active, close }) => {
                                        return (
                                          <div>
                                            <div
                                              className={`${
                                                active &&
                                                event.stages.length === 0
                                                  ? "bg-primary"
                                                  : ""
                                              } ${
                                                event.stages.length > 0
                                                  ? "cursor-not-allowed opacity-50"
                                                  : "cursor-pointer"
                                              } flex flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                              onClick={() => {
                                                if (event.stages.length > 0)
                                                  return;
                                                setAddEventModalState({
                                                  open: true,
                                                  title: `Add a category under ${event.name}`,
                                                  parentEventId: event.id,
                                                });
                                                close();
                                              }}
                                            >
                                              <span>
                                                <RiMenuAddFill />
                                              </span>
                                              Add Category
                                            </div>
                                          </div>
                                        );
                                      }}
                                    </Menu.Item>
                                  ) : null}
                                  {!event.childEvents?.length ? (
                                    <Menu.Item>
                                      {({ active, close }) => {
                                        return (
                                          <div>
                                            <div
                                              className={`${
                                                active ? "bg-primary" : ""
                                              } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                              onClick={() => {
                                                setAddStageModalState({
                                                  open: true,
                                                  event: event,
                                                });
                                                close();
                                              }}
                                            >
                                              <span>
                                                <TiPlus />
                                              </span>
                                              Add Stage
                                            </div>
                                          </div>
                                        );
                                      }}
                                    </Menu.Item>
                                  ) : null}
                                  <Menu.Item>
                                    {({ active, close }) => {
                                      return (
                                        <div>
                                          <div
                                            className={`${
                                              active ? "bg-primary" : ""
                                            } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                            onClick={() => {
                                              setEditModalState({
                                                open: true,
                                                event: event,
                                                stage: undefined,
                                              });
                                              close();
                                            }}
                                          >
                                            <span>
                                              <MdModeEdit />
                                            </span>
                                            Edit Category
                                          </div>
                                        </div>
                                      );
                                    }}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active, close }) => {
                                      return (
                                        <div>
                                          <div
                                            className={`${
                                              active ? "bg-primary" : ""
                                            } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                            onClick={() => {
                                              setEditModalState({
                                                open: true,
                                                event: event,
                                                stage: undefined,
                                              });
                                              close();
                                            }}
                                          >
                                            <span>
                                              <BiMove />
                                            </span>
                                            Move
                                          </div>
                                        </div>
                                      );
                                    }}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active, close }) => {
                                      return (
                                        <div>
                                          <div
                                            className={`${
                                              active ? "bg-primary" : ""
                                            } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                            onClick={() => {
                                              setDeleteModalState({
                                                open: true,
                                                event: event,
                                                stage: undefined,
                                              });
                                              close();
                                            }}
                                          >
                                            <span>
                                              <BsFillTrashFill />
                                            </span>
                                            Delete Category
                                          </div>
                                        </div>
                                      );
                                    }}
                                  </Menu.Item>
                                </Menu.Items>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </Menu>
                    </div>
                    <AnimatePresence>
                      {open && (
                        <Disclosure.Panel
                          className={className ?? "" + " mr-8"}
                          as={motion.div}
                          initial={{ height: 0, overflowY: "hidden" }}
                          animate={{ height: "auto", overflowY: "visible" }}
                          exit={{ height: 0, overflowY: "hidden" }}
                          static
                        >
                          <EventList
                            eventList={event.childEvents || []}
                            setAddEventModalState={setAddEventModalState}
                            setAddStageModalState={setAddStageModalState}
                            setEditModalState={setEditModalState}
                            setDeleteModalState={setDeleteModalState}
                          />
                          {event.stages && !event.childEvents && (
                            <>
                              {event.stages.map((stage, i) => (
                                <div
                                  key={stage.stageCode}
                                  className="relative mt-2 flex w-full max-w-[calc(100%-80px)] gap-2"
                                  style={{ zIndex: `-${i}` }}
                                >
                                  <div className="w-full max-w-[calc(100%-80px)] rounded-md bg-gray-300 p-2 text-center font-bold">
                                    {stage.stageCode}
                                  </div>
                                  <Menu as="div" className="relative z-10">
                                    {({ open }) => (
                                      <>
                                        <Menu.Button className="relative z-10 flex h-10 max-h-full w-10 items-center justify-center rounded-md bg-primary focus:outline-none">
                                          <BsThreeDotsVertical />
                                        </Menu.Button>
                                        <AnimatePresence>
                                          {open && (
                                            <Menu.Items
                                              static
                                              as={motion.div}
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              exit={{ opacity: 0, y: 10 }}
                                              className="absolute top-10 right-0 z-50 rounded-md border border-gray-500 bg-gray-300 p-1 shadow-2xl shadow-gray-800 overflow-y-hidden focus:outline-none"
                                              role="menu"
                                              aria-labelledby="options-menu"
                                            >
                                              <Menu.Item>
                                                {({ active, close }) => {
                                                  return (
                                                    <div>
                                                      <div
                                                        className={`${
                                                          active
                                                            ? "bg-primary"
                                                            : ""
                                                        } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                                        onClick={() => {
                                                          setEditModalState({
                                                            open: true,
                                                            event: event,
                                                            stage: stage,
                                                          });
                                                          close();
                                                        }}
                                                      >
                                                        <span>
                                                          <MdModeEdit />
                                                        </span>
                                                        Edit Stage
                                                      </div>
                                                    </div>
                                                  );
                                                }}
                                              </Menu.Item>
                                              <Menu.Item>
                                                {({ active, close }) => {
                                                  return (
                                                    <div>
                                                      <div
                                                        className={`${
                                                          active
                                                            ? "bg-primary"
                                                            : ""
                                                        } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                                        onClick={() => {
                                                          setEditModalState({
                                                            open: true,
                                                            event: event,
                                                            stage: stage,
                                                          });
                                                          close();
                                                        }}
                                                      >
                                                        <span>
                                                          <BiMove />
                                                        </span>
                                                        Move Stage
                                                      </div>
                                                    </div>
                                                  );
                                                }}
                                              </Menu.Item>
                                              <Menu.Item>
                                                {({ active, close }) => {
                                                  return (
                                                    <div>
                                                      <div
                                                        className={`${
                                                          active
                                                            ? "bg-primary"
                                                            : ""
                                                        } flex cursor-pointer flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                                        onClick={() => {
                                                          setDeleteModalState({
                                                            open: true,
                                                            event: event,
                                                            stage: stage,
                                                          });
                                                          close();
                                                        }}
                                                      >
                                                        <span>
                                                          <BsFillTrashFill />
                                                        </span>
                                                        Delete Stage
                                                      </div>
                                                    </div>
                                                  );
                                                }}
                                              </Menu.Item>
                                            </Menu.Items>
                                          )}
                                        </AnimatePresence>
                                      </>
                                    )}
                                  </Menu>
                                </div>
                              ))}
                              {/* <Button
                                className="-z-50 mt-2 w-[calc(100%-80px)] truncate py-2"
                                onClick={() => {
                                  setAddStageModalState({
                                    open: true,
                                    event: event,
                                  });
                                }}
                              >
                                Add Stage
                              </Button> */}
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
