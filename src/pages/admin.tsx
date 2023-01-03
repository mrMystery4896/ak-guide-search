import { Tab } from "@headlessui/react";
import { Operator } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import EditEventList from "../components/EditEventList";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { EventWithChildren } from "../utils/common-types";
import { useMediaQuery } from "react-responsive";
import React from "react";
import { motion } from "framer-motion";

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

const AdminPage: NextPage<AdminPageProps> = ({ operatorList, eventList }) => {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <>
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <Tab.Group
        vertical={!isSmallScreen}
        as="div"
        className="mt-2 flex h-auto w-auto flex-col md:mt-4 md:flex-row"
      >
        <Tab.List className="flex overflow-x-scroll scrollbar-none md:flex-col">
          <TabItem>Add Events</TabItem>
          <TabItem>Add Operators</TabItem>
          <TabItem>Manage Users</TabItem>
        </Tab.List>
        <Tab.Panels className="m-4">
          <Tab.Panel>
            <EditEventList eventList={eventList} />
          </Tab.Panel>
          <Tab.Panel>
            <h2>Add Operators</h2>
          </Tab.Panel>
          <Tab.Panel>
            <h2>Manage Users</h2>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default AdminPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const operatorList = await prisma?.operator.findMany({
    orderBy: [
      {
        rarity: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
  const eventList = await prisma?.event.findMany({
    include: {
      stages: true,
    },
  });

  // Transform eventList from flat list to tree
  const map = new Map<string, EventWithChildren>();
  const roots: EventWithChildren[] = [];

  eventList?.forEach((event) => map.set(event.id, event));
  eventList?.forEach((event) => {
    if (event.parentEventId) {
      const parent = map.get(event.parentEventId);
      if (parent) {
        if (!parent.childEvents) {
          parent.childEvents = [];
        }
        parent.childEvents.push(event);
      }
    } else {
      roots.push(event);
    }
  });

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
      eventList: JSON.parse(JSON.stringify(roots)),
    },
  };
};
