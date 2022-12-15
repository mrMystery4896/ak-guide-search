import { type NextPage } from "next";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import { env } from "../env/client.mjs";

const Home: NextPage = () => {
  const data = trpc.guide.getRecentGuides.useQuery(1);

  if (data.isLoading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="text-2xl font-bold">Hello World</h1>

      {data.status === "success" ? (
        data.data.map((guide) => {
          return (
            <div key={guide.id}>
              <p>{guide.title}</p>
              <p>Operators: </p>
              <ul>
                {guide.operators.map((operator) => {
                  return (
                    <li key={operator.id}>
                      <Image
                        src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                        alt={operator.id}
                        width={100}
                        height={100}
                      />
                      {operator.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      ) : (
        <p>error</p>
      )}
    </>
  );
};

export default Home;
