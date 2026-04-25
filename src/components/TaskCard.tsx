import type { Task } from './type/typesInterface';

interface TaskCardProps {
  task: Task;
}

/**
 * 
 * we need to add task bar here which increases upon status
 * 3 days left 4 days left 1 week left timer shown on card instead of date.
 * tags on top right as per design
 * need to meet the design requirement
 */

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