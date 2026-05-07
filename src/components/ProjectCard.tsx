import { useNavigate } from 'react-router-dom';
import type { Project } from './type/typesInterface';
import { EditIcon, MoreHorizontalIcon, TaskIcon } from './Icons';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  iconSize?: number;
}

/**
 * Formats an ISO date string into a user-friendly format.
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * ProjectCard Component
 * Displays a summary of a single project and provides actions to edit, delete, or view details.
 */
export default function ProjectCard({ project, onEdit, onDelete, iconSize = 16 }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className='bg-surface-default border border-border rounded-lg p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 relative overflow-hidden cursor-pointer group' 
      onClick={() => navigate(`/project/${project.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/project/${project.id}`)}
    >
      {/* Top Border Gradient Hover Effect */}
      <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary to-accent-orange opacity-0 group-hover:opacity-100 transition-opacity' />
      
      <div className='flex justify-between items-start mb-3'>
        <h3 className='font-heading text-lg font-semibold text-text-primary m-0 line-clamp-2'>
          {project.name}
        </h3>
        
        {/* Action Buttons */}
        <div className='flex gap-1'>
          <button
            className='w-8 h-8 border-none rounded flex items-center justify-center bg-transparent text-text-secondary hover:bg-bg-active hover:text-text-primary cursor-pointer transition-all'
            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            title='Edit project'
            aria-label='Edit project'
          >
            <EditIcon size={iconSize} />
          </button>
          <button
            className='w-8 h-8 border-none rounded flex items-center justify-center bg-transparent text-text-secondary hover:bg-bg-active hover:text-text-primary cursor-pointer transition-all'
            onClick={(e) => { e.stopPropagation(); onDelete(project); }}
            title='Delete project'
            aria-label='Delete project'
          >
            <MoreHorizontalIcon size={iconSize} />
          </button>
        </div>
      </div>
      
      <p className='font-body text-sm text-text-secondary m-0 mb-4 line-clamp-2'>
        {project.description || 'No description provided'}
      </p>
      
      {/* Footer Info */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-3 items-center'>
          {project.taskCount != null && (
            <span className='flex items-center gap-1 font-ui text-xs text-text-secondary'>
              <TaskIcon size={12} />
              {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className='font-ui text-xs text-text-secondary'>{formatDate(project.createdAt)}</span>
      </div>
    </div>
  );
}