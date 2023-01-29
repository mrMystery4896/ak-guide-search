import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Layout from "../components/Layout";

import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import Modal from "../components/Modal";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Modal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <NextNProgress height={2} color="#6291E9" />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
