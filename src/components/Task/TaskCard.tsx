import { useTaskContext } from "../../context/TaskContext";

interface TaskCardProps {
  taskId: string;
}

export default function TaskCard({ taskId }: TaskCardProps){
  const { getTaskById } = useTaskContext();
  const currentTask = getTaskById(taskId);

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