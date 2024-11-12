import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Button } from "../components/ui/button";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";

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

const deleteCounter = createServerFn("POST", async () => {
  deleteCookie(COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });
  return 0;
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  const handleCountUpdate = (amount: number) => {
    updateCount(amount).then(() => {
      router.invalidate();
    });
  };

  const handleDelete = () => {
    deleteCounter().then(() => {
      router.invalidate();
    });
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={() => handleCountUpdate(1)}
      >
        Add 1 to {state}
      </Button>
      
      <Button 
        variant="secondary"
        onClick={() => handleCountUpdate(-1)}
      >
        Subtract 1 from {state}
      </Button>
      
      <Button 
        variant="destructive"
        onClick={handleDelete}
      >
        Reset Counter
      </Button>
    </div>
  );
}