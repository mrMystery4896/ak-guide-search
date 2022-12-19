import Link from "next/link";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "./Button";
import Input from "./Input";
import LoadingSpinner from "./LoadingSpinner";
import { Menu } from "@headlessui/react";
import Image from "next/image";
import { FaUser, FaSearch, FaFilter } from "react-icons/fa";
import { BsFillGearFill } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";
import { MdLibraryAdd } from "react-icons/md";

interface NavbarProps {
  session: ReturnType<typeof useSession>;
}

const Navbar: React.FC<NavbarProps> = ({ session }) => {
  return (
    <nav className="flex items-center justify-between px-6 py-3 md:px-16 md:py-7">
      <Link
        href="/"
        className="hidden align-middle text-2xl font-bold md:block"
      >
        AKGuideSearch
      </Link>
      <Link
        href="/"
        className="block h-full align-middle text-xl font-bold md:hidden"
      >
        AKGS
      </Link>
      <div className="flex">
        <div className="relative">
          <Input
            placeholder="Search..."
            className="w-[40vw] rounded-l-md rounded-r-none"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-4">
            <button className="h-full">
              <FaSearch />
            </button>
          </span>
        </div>
        <Button className="rounded-l-none rounded-r-md">
          <FaFilter />
        </Button>
      </div>
      <div className="h-10">
        {session.status === "loading" ? (
          <LoadingSpinner />
        ) : session.status === "authenticated" ? (
          <>
            <Menu as="div" className="relative">
              <Menu.Button className="focus:outline-none">
                {/* user profile picture round as button */}
                {session.data.user?.image ? (
                  <Image
                    src={session.data.user.image}
                    alt="user profile picture"
                    width={40}
                    height={40}
                    className="h-full rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 focus:outline-none">
                    <FaUser className="text-2xl" />
                  </div>
                )}
              </Menu.Button>
              <Menu.Items className="absolute z-10 flex -translate-x-1/2 flex-col rounded-md bg-gray-300 p-1 drop-shadow-md">
                <Menu.Item>
                  {({ active, close }) => {
                    return (
                      <Link href="/submit-guide" onClick={close}>
                        <div
                          className={`${
                            active ? "bg-primary" : ""
                          } flex flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                        >
                          <span>
                            <MdLibraryAdd />
                          </span>
                          Submit Guide
                        </div>
                      </Link>
                    );
                  }}
                </Menu.Item>
                <Menu.Item>
                  {({ active, close }) => {
                    return (
                      <Link href="/settings" onClick={close}>
                        <div
                          className={`${
                            active ? "bg-primary" : ""
                          } flex flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                        >
                          <span>
                            <BsFillGearFill />
                          </span>
                          Settings
                        </div>
                      </Link>
                    );
                  }}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => {
                    return (
                      <button onClick={() => signOut()}>
                        <div
                          className={`${
                            active ? "bg-primary" : ""
                          } flex flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                        >
                          <span>
                            <GoSignOut />
                          </span>
                          Sign Out
                        </div>
                      </button>
                    );
                  }}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </>
        ) : (
          <>
            <Button onClick={() => signIn("google")}>Sign In</Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
