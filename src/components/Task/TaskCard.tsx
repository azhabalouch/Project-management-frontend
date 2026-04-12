import type { Task } from '../type/typesInterface';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps){
  return(
    <div className='task-card'>
      <h3 className='task-title'>{task.title}</h3>
      <p className='task-description'>{task.description}</p>
      <div className='task-meta'>
        <span>Status: {task.status}</span>
        <span>Due: {task.dueDate?.toLocaleString()}</span>
      </div>
    </div>
  )
}