import { useState } from "react";
import TaskCard from "./TaskCard";
import TaskEdit from "./TaskEdit";
import { useTaskContext } from "../../context/TaskContext";

interface ShowTaskModeProps {
  taskId: string;
}

export default function ShowTaskMode({ taskId }: ShowTaskModeProps){
  const [editMode, setEditMode] = useState(false);
  const { getTaskById } = useTaskContext();
  const currentTask = getTaskById(taskId);

  if (!currentTask) {
    return null;
  }

  return(
    <>
      {editMode ? <TaskEdit taskId={taskId} /> : <TaskCard taskId={taskId} />}
      
      <button onClick={() => setEditMode((current) => !current)}>Edit task</button>
    </>
  )
}