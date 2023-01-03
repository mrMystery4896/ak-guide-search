import { Operator, Event, Stage } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import Button from "../components/Button";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

type EventWithChildren = Event & {
  stages: Stage[];
  childEvents?: EventWithChildren[];
};

interface AdminPageProps {
  operatorList: Operator[];
  eventList: EventWithChildren[];
}

const AdminPage: NextPage<AdminPageProps> = ({ operatorList, eventList }) => {
  return (
    <>
      <h1>Admin Page</h1>
      <NestedEvent eventList={eventList} />
    </>
  );
};

const NestedEvent: React.FC<{ eventList: EventWithChildren[] }> = ({
  eventList,
}) => {
  return (
    <ul className="border-l-2 border-gray-300 p-2">
      {eventList.map((event) => {
        return (
          <li key={event.id}>
            {event.name + " " + event.id}
            {event.childEvents && <NestedEvent eventList={event.childEvents} />}
            {event.stages.length > 0 ? (
              <>
                <ul className="border-l-2 border-gray-300 p-2">
                  {event.stages.map((stage) => (
                    <li key={stage.stageCode}>{stage.stageCode}</li>
                  ))}
                  <Button>Add Stage</Button>
                </ul>
              </>
            ) : null}
          </li>
        );
      })}
      <Button onClick={() => console.log(eventList[0]?.parentEventId)}>
        Add to {eventList[0]?.parentEventId || "root"}
      </Button>
    </ul>
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
