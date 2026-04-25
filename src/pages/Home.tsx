import 'react-datepicker/dist/react-datepicker.css';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import './style/Home.css';

const iconL = 40;
const iconS = 24;

export default function Home(){
  const { tasks, loading, error } = useTaskContext();
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()}/${current.getFullYear()}`;

  return(
    <div className='home-layout'>
      <SideNavigation/>

      {/* Main Container */}
      <main className='home-main'>
        <TopNavigation/>

        {/* Content Area */}
        <section className='home-content'>
          <div className='home-header'>
            <div className='home-header-title-container'>
              <h1 className='home-header-title'>
                <img src="/history.svg" alt="Today" width={iconL} height={iconL} />
                Today {date}
              </h1>
            </div>
            <button className='btn-secondary home-header-edit-btn'>
              <img src="/edit.svg" alt="Edit" width={iconS} height={iconS} /> Edit
            </button>
          </div>

          <div className='home-filters'>
            <div className='home-filter-tabs-container'>
              <span className='home-filter-tab tab-all'>All</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-high'>High</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-medium'>Medium</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-low'>Low</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-inprogress'>In-progress</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-pending'>Pending</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-skipped'>Skipped</span>
              <div className='home-filter-divider'></div>
              <span className='home-filter-tab tab-bug'>Bug</span>
            </div>
            
            <div className='home-filter-actions'>
              <div className='home-filter-sort-btn'>
                <span>Sort</span>
                <img src="/chevron-down.svg" alt="chevron-down" width={iconS} height={iconS} />
              </div>
              <img src="/dots.svg" alt="extend menu" width={iconS} height={iconS} />
            </div>
          </div>

          {loading ? (
            <p>Loading tasks.</p>
          ) : error ? (
            <p>Unable to load tasks.</p>
          ) : tasks.length > 0 ? (
            <ul className='task-list'>
              {tasks.map(task => (
                <li key={task.id} className='task-item'>
                  <TaskCard task={task} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks found.</p>
          )}

          <div className='home-section-header'>
            <img src="/skip-fill-16.svg" alt="Skip" width={iconL} height={iconL} />
            <h2>Skippable</h2>
          </div>
        </section>
      </main>
    </div>
  )
}