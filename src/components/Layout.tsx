import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const session = useSession();

  if (session.status === "loading") return <p>Loading</p>;

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
