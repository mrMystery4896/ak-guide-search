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
import { AnimatePresence, motion } from "framer-motion";

interface NavbarProps {
  session: ReturnType<typeof useSession>;
}

const Navbar: React.FC<NavbarProps> = ({ session }) => {
  return (
    <nav className="flex items-center justify-between px-6 py-3 md:px-16 md:py-7">
      <Link href="/" className="hidden text-2xl font-bold md:block">
        AKGuideSearch
      </Link>
      <Link href="/" className="block h-full text-xl font-bold md:hidden">
        AKGS
      </Link>
      <div className="flex">
        <div className="relative">
          <Input
            placeholder="Search..."
            className="max-h-10 w-[30vw] rounded-l-md rounded-r-none md:w-[40vw]"
            inputDivClassName="mb-0"
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
      <div className="flex h-8 w-8 items-center justify-center md:h-10 md:w-10">
        {session.status === "loading" ? (
          <LoadingSpinner className="align-middle" />
        ) : session.status === "authenticated" ? (
          <>
            <Menu as="div" className="relative md:h-10">
              {({ open }) => (
                <>
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
                  <AnimatePresence>
                    {open && (
                      <Menu.Items
                        as={motion.div}
                        key="menu"
                        static
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 z-10 flex flex-col rounded-md bg-gray-300 p-1 drop-shadow-md md:translate-x-1/3"
                      >
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
                        {session.data.user?.role === "ADMIN" ? (
                          <Menu.Item>
                            {({ active, close }) => {
                              return (
                                <Link href="/admin" onClick={close}>
                                  <div
                                    className={`${
                                      active ? "bg-primary" : ""
                                    } flex flex-row items-center gap-1 whitespace-nowrap rounded-md p-2 focus:outline-none md:gap-3`}
                                  >
                                    <span>
                                      <FaUser />
                                    </span>
                                    Admin Settings
                                  </div>
                                </Link>
                              );
                            }}
                          </Menu.Item>
                        ) : null}
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
                    )}
                  </AnimatePresence>
                </>
              )}
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
