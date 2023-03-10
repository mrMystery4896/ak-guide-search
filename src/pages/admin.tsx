import { Tab } from "@headlessui/react";
import type { Operator } from "@prisma/client";
import { motion } from "framer-motion";
import type { GetServerSideProps, NextPage } from "next";
import React from "react";
import { useMediaQuery } from "react-responsive";
import EventList from "../components/EditEventList";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import type { EventWithChildren } from "../utils/common-types";
import { getEvent } from "../utils/functions";

interface AdminPageProps {
  operatorList: Operator[];
  eventList: EventWithChildren[];
}

const TabItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tab as={React.Fragment}>
      {({ selected }) => (
        <div
          className={`relative h-auto cursor-pointer whitespace-nowrap p-2 font-semibold focus:outline-none md:pr-4 md:text-right ${
            selected ? "text-primary" : "text-gray-100"
          } `}
        >
          {children}
          {selected && (
            <motion.div
              layoutId={selected ? "selectedTab" : ""}
              className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-primary md:top-0 md:right-0 md:left-auto md:h-full md:w-1"
            />
          )}
        </div>
      )}
    </Tab>
  );
};

const AdminPage: NextPage<AdminPageProps> = ({ eventList }) => {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <>
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <Tab.Group
        vertical={!isSmallScreen}
        as="div"
        className="mt-2 flex h-auto w-full flex-col md:mt-4 md:flex-row"
      >
        <Tab.List className="flex overflow-x-scroll scrollbar-none md:w-48 md:flex-col">
          <TabItem>Manage Events</TabItem>
          <TabItem>Manage Operators</TabItem>
          <TabItem>Manage Users</TabItem>
        </Tab.List>
        <Tab.Panels className="w-full pt-4 md:p-4 md:pt-0">
          <Tab.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mt-0 text-xl font-bold">Manage Events and Stages</h2>
            <EventList eventList={eventList} />
          </Tab.Panel>
          <Tab.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="m-2 mt-0 text-xl font-bold">Manage Operators</h2>
          </Tab.Panel>
          <Tab.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="m-2 mt-0 text-xl font-bold">Manage Users</h2>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default AdminPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const operatorList = await prisma.operator.findMany({
    orderBy: [
      {
        rarity: "desc",
      },
      {
        name: "asc",
      },
    ],
  });

  const eventList = await getEvent();

  if (session?.user?.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      operatorList,
      eventList: JSON.parse(JSON.stringify(eventList)),
    },
  };
};
