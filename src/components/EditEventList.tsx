import Button from "./Button";
import { EventWithChildren } from "../utils/common-types";

const EditEventList: React.FC<{ eventList: EventWithChildren[] }> = ({
  eventList,
}) => {
  return (
    <>
      <h2 className="m-2 mt-0 text-xl font-bold">Manage Events and Stages</h2>
      <ul className="border-l-2 border-gray-300 p-2">
        {eventList.map((event) => {
          return (
            <li key={event.id}>
              {event.name + " " + event.id}
              {event.childEvents && (
                <EditEventList eventList={event.childEvents} />
              )}
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
    </>
  );
};

export default EditEventList;
