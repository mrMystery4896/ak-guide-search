import Link from "next/link";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const Navbar: React.FC = () => {
  const session = useSession();

  if (session.status === "loading") return null;

  return (
    <nav>
      <Link href="/" className="text-2xl font-bold">
        AK Guide Search
      </Link>
      {session.status === "authenticated" ? (
        <>
          <Link href="/submit-guide">Submit Guide</Link>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <>
          <button onClick={() => signIn("google")}>Sign In</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
