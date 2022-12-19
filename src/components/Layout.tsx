import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const session = useSession();

  return (
    <>
      <Navbar session={session} />
      <main className=" px-6 md:px-16">{children}</main>
    </>
  );
};

export default Layout;
