import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import GuideCard from "../components/GuideCard";

const Home: NextPage = () => {
  const data = trpc.guide.getRecentGuides.useQuery(3);

  if (data.isLoading) return <p>Loading...</p>;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold">Recently Added</h2>
      <div className="flex min-w-full flex-col gap-2 md:gap-4">
        {/* <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"> */}
        {data.status === "success" ? (
          data.data.map((guide) => {
            return <GuideCard guide={guide} key={guide.id} />;
          })
        ) : (
          <p>error</p>
        )}
      </div>
    </>
  );
};

export default Home;
