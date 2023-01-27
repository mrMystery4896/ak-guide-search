import type { GetServerSideProps, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Settings: NextPage = () => {
  return <div>Settings</div>;
};

export default Settings;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
