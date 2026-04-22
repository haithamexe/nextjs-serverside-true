import { getHomeTodos } from "@/app/lib/home/service";
import HomePageList from "./HomePageList";

const HomePage = async () => {
  const todos = await getHomeTodos();

  return (
    <div>
      <h1>HomePage</h1>
      <HomePageList todos={todos} />
    </div>
  );
};

export default HomePage;
