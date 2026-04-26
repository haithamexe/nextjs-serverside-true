import { getHomeTodosFromApi } from "@/app/_lib/home/server-api";
import HomePageList from "./HomePageList";

const HomePage = async () => {
  const todos = await getHomeTodosFromApi();

  return (
    <div>
      <h1>HomePage</h1>
      <HomePageList initialData={todos} />
    </div>
  );
};

export default HomePage;
