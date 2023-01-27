import type { NextPage } from "next";

const NotFoundPage: NextPage = () => {
  return (
    <div className="absolute top-1/2 left-1/2 w-screen -translate-x-1/2 -translate-y-1/2">
      <h1 className="mx-auto max-w-[80%] text-center text-2xl font-bold md:text-4xl">
        Oops! Your page is not found.
      </h1>
    </div>
  );
};

export default NotFoundPage;
