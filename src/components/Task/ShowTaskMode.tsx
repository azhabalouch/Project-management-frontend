import { useState } from "react";
import TaskCard from "./TaskCard";
import TaskInput from "./TaskInput";

export default function ShowTaskMode(){
  const [editMode, setEditMode] = useState(false);

  return(
    <>
      {editMode ? <TaskInput /> : <TaskCard />}
      
      <button onClick={() => setEditMode((current) => !current)}>Edit task</button>
    </>
  )
}