import type { HomeTodo } from "@/app/lib/home/types";

interface HomePageListProps {
  todos: HomeTodo[];
}

const HomePageList = ({ todos }: HomePageListProps) => {
  if (todos.length === 0) {
    return <p className="p-5">No todos available.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 p-5 ">
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};

export default HomePageList;
