import { useContext } from "react";
import { TaskContext } from "../../context/TaskContext";

export default function TaskCard(){
  const currentTask = useContext(TaskContext);

  if (!currentTask) {
    return null;
  }

  return(
    <div className='task-card'>
      <h3 className='task-title'>{currentTask.title}</h3>
      <p className='task-description'>{currentTask.description}</p>
      <div className="task-meta">
        <span>Status: {currentTask.status}</span>
        <span>Due: {currentTask.dueDate?.toLocaleString()}</span>
      </div>
    </div>
  )
}