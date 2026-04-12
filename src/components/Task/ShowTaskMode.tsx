import { useState } from 'react';
import TaskCard from './TaskCard';
import TaskEdit from './TaskEdit';
import type { Task } from '../type/typesInterface';

interface ShowTaskModeProps {
  task: Task;
}

export default function ShowTaskMode({ task }: ShowTaskModeProps){
  const [editMode, setEditMode] = useState(false);

  return(
    <>
      {editMode ? <TaskEdit task={task} onDone={() => setEditMode(false)} /> : <TaskCard task={task} />}
      
      <button onClick={() => setEditMode((current) => !current)}>Edit task</button>
    </>
  )
}