
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { addTask, getTasks, updateTask, deleteTask } from './tasks'

  createRoot(document.getElementById("root")!).render(<App />);
  