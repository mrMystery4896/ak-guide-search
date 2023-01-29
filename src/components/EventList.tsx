import { Disclosure, Menu } from "@headlessui/react";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import type { EventWithChildren } from "../utils/common-types";
import { RiMenuAddFill } from "react-icons/ri";
import { BsFillTrashFill, BsThreeDotsVertical } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { TiPlus } from "react-icons/ti";
import { BiMove } from "react-icons/bi";
import { useModal } from "../stores/modalStore";
import DeleteModal from "./DeleteModal";
import MoveModal from "./MoveModal";
import EditModal from "./EditModal";
import AddStageModal from "./AddStageModal";
import AddEventModal from "./AddEventModal";

interface EventListProps {
  eventList: EventWithChildren[];
  className?: string;
  parentEventIdStack?: string[];
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
  parentEventIdStack = [], // Used to keep track of the parent event ids for move modal
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const modal = useModal();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line
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

                                                modal.open({
                                                  title: `Add a category under ${event.name}`,
                                                  children: (
                                                    <AddEventModal
                                                      parentEventId={event.id}
                                                    />
                                                  ),
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
                                                modal.open({
                                                  title: `Add a stage under ${event.name}`,
                                                  children: (
                                                    <AddStageModal
                                                      event={event}
                                                    />
                                                  ),
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
                                              modal.open({
                                                title: `Edit ${event.name}`,
                                                children: (
                                                  <EditModal event={event} />
                                                ),
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
                                              modal.open({
                                                title: `Move ${event.name}`,
                                                children: (
                                                  <MoveModal
                                                    event={event}
                                                    eventIdStack={
                                                      parentEventIdStack
                                                    }
                                                  />
                                                ),
                                              });
                                              close();
                                            }}
                                          >
                                            <span>
                                              <BiMove />
                                            </span>
                                            Move Category
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
                                              modal.open({
                                                title: `Delete ${event.name}`,
                                                children: (
                                                  <DeleteModal event={event} />
                                                ),
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
                          className={className ?? "" + " mr-8 w-auto"}
                          as={motion.div}
                          initial={{ height: 0, overflowY: "hidden" }}
                          animate={{ height: "auto", overflowY: "visible" }}
                          exit={{ height: 0, overflowY: "hidden" }}
                          static
                        >
                          <EventList
                            eventList={event.childEvents || []}
                            parentEventIdStack={[
                              ...parentEventIdStack,
                              event.id,
                            ]}
                          />
                          {event.stages && !event.childEvents && (
                            <>
                              {event.stages.map((stage, i) => (
                                <div
                                  key={stage.id}
                                  className="relative mt-2 flex w-full max-w-[calc(100%-80px)] justify-between gap-2"
                                  style={{ zIndex: `-${i}` }}
                                >
                                  <div className="min-w-full rounded-md bg-gray-300 p-2 px-4 text-center">
                                    <p className="truncate">
                                      {stage.stageCode && (
                                        <span>
                                          <b>{stage.stageCode} - </b>
                                        </span>
                                      )}
                                      {stage.stageName}
                                    </p>
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
                                                          modal.open({
                                                            title: `Edit ${
                                                              stage.stageCode
                                                                ? stage.stageCode +
                                                                  " - "
                                                                : ""
                                                            }${
                                                              stage.stageName
                                                            }`,
                                                            children: (
                                                              <EditModal
                                                                event={event}
                                                                stage={stage}
                                                              />
                                                            ),
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
                                                          modal.open({
                                                            title: `Move ${
                                                              stage.stageCode
                                                                ? stage.stageCode +
                                                                  " - "
                                                                : ""
                                                            }${
                                                              stage.stageName
                                                            }`,
                                                            children: (
                                                              <MoveModal
                                                                event={event}
                                                                stage={stage}
                                                                eventIdStack={
                                                                  parentEventIdStack
                                                                }
                                                              />
                                                            ),
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
                                                          modal.open({
                                                            title: `Delete ${
                                                              stage.stageCode
                                                                ? stage.stageCode +
                                                                  " - "
                                                                : ""
                                                            }${
                                                              stage.stageName
                                                            }`,
                                                            children: (
                                                              <DeleteModal
                                                                event={event}
                                                                stage={stage}
                                                              />
                                                            ),
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
