import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  // const hello = trpc.example.hello.useQuery({ text: "from tRPC" });
  const session = useSession();

  if (session.status === "loading") return (<p>Loading...</p>);

  return (
    <>
      <h1 className="text-2xl font-bold">Hello World</h1>
      {session.status === "authenticated" ? (<><p>{session.data.user?.name}. { session.data.user?.role }</p><br /><button onClick={ () => signOut()}>Sign Out</button></>) : (<><p>Not Logged In</p><br/><button onClick={() => signIn("google")}>Sign In</button></>)}
    </>
  );
};

export default Home;