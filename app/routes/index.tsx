import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Button } from "../components/ui/button";
import { getCookie, setCookie } from "vinxi/http";

const COOKIE_NAME = "visitor-count";

async function readCount() {
  const countCookie = getCookie(COOKIE_NAME);
  return parseInt(countCookie ?? "0");
}

const getCount = createServerFn("GET", () => {
  return readCount();
});

const updateCount = createServerFn("POST", async (addBy: number) => {
  const count = await readCount();
  const newCount = count + addBy;
  
  // Set cookie with a reasonable expiration (e.g., 1 year)
  setCookie(COOKIE_NAME, newCount.toString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });
  
  return newCount;
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <Button
      onClick={() => {
        updateCount(1).then(() => {
          router.invalidate();
        });
      }}
    >
      Add 1 to {state}?
    </Button>
  );
}