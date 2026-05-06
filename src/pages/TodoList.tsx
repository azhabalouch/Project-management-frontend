import { useState, useEffect } from 'react';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import { useGet } from '../hooks/useGet';
import { usePost } from '../hooks/usePost';
import { usePatch } from '../hooks/usePatch';
import { useDelete } from '../hooks/useDelete';
import { TODO_URLS } from '../apis';
import { useToast } from '../context/ToastContext';
import type { Todo, HandleSubmitEvent } from '../components/type/typesInterface';


export default function TodoList() {
  const { execute: fetchTodos, loading, error } = useGet<Todo[]>(TODO_URLS.get);
  const { execute: createTodo, loading: creating, error: createError } = usePost(TODO_URLS.create);
  const { execute: patchTodo, loading: patching } = usePatch(TODO_URLS.patch);
  const { remove: deleteTodo, loading: deleting } = useDelete(TODO_URLS.delete);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newText, setNewText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTodos();
        if (Array.isArray(data)) {
          setTodos(data.map(normalizeTodo));
        }
      } catch {
        // Error handled by useGet
      }
    };
    load();
  }, [fetchTodos]);

  const normalizeTodo = (todo: any): Todo => {
    const rawId = todo?.id ?? todo?._id ?? todo?.todoId;
    const rawText = todo?.text ?? todo?.title ?? todo?.todo ?? todo?.name ?? todo?.task;
    const rawCompleted = todo?.isCompleted ?? todo?.completed ?? todo?.done;
    const rawCreatedAt = todo?.createdAt ?? todo?.created_at ?? todo?.updatedAt;

    return {
      id: String(rawId ?? ''),
      text: String(rawText ?? ''),
      isCompleted: Boolean(rawCompleted),
      createdAt: String(rawCreatedAt ?? ''),
    };
  };

  const handleCreate = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const trimmedText = newText.trim();
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];
    const result = await createTodo({
      text: trimmedText,
      completed: false,
      date: today,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    if (result) {
      if (result === true) {
        const data = await fetchTodos();
        if (Array.isArray(data)) setTodos(data.map(normalizeTodo));
      } else if (typeof result === 'object') {
        const normalized = normalizeTodo(result);
        setTodos((prev) => [
          ...prev,
          {
            ...normalized,
            text: normalized.text || trimmedText,
          },
        ]);
      }
      setNewText('');
      addToast('Todo added', 'success');
    }
  };

  const handleToggle = async (todo: Todo) => {
    const nextCompleted = !todo.isCompleted;
    const result = await patchTodo({
      id: todo.id,
      todoId: todo.id,
      isCompleted: nextCompleted,
      completed: nextCompleted,
    });
    if (result) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t))
      );
    }
  };

  const handleDelete = async (todoId: string) => {
    const result = await deleteTodo({ id: todoId, todoId });
    if (result) {
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      addToast('Todo removed', 'info');
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.isCompleted;
    if (filter === 'completed') return todo.isCompleted;
    return true;
  });

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
          <div className='home-header'>
            <div className='home-header-title-container'>
              <h1 className='home-header-title'>To-Do List</h1>
              <span className='home-task-count'>{activeCount} remaining</span>
            </div>
          </div>

          {createError && (
            <div className='task-detail-error'>{createError}</div>
          )}

          <form onSubmit={handleCreate} className='todo-input-bar'>
            <input
              type='text'
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder='Add a new to-do...'
              className='todo-input'
              disabled={creating}
            />
            <button type='submit' className='btn-primary' disabled={creating || !newText.trim()}>
              {creating ? 'Adding...' : 'Add'}
            </button>
          </form>

          <div className='todo-filters'>
            <button
              className={`todo-filter-btn ${filter === 'all' ? 'todo-filter-btn--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({todos.length})
            </button>
            <button
              className={`todo-filter-btn ${filter === 'active' ? 'todo-filter-btn--active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button
              className={`todo-filter-btn ${filter === 'completed' ? 'todo-filter-btn--active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </button>
          </div>

          {loading ? (
            <div className='home-loading-state'>
              <div className='loading-spinner'></div>
              <p>Loading to-dos...</p>
            </div>
          ) : error ? (
            <div className='home-error-state'>
              <img src="/error.svg" alt="Error" width={48} height={48} />
              <p>Unable to load to-dos. Please try again.</p>
              <button className='btn-primary' onClick={fetchTodos}>Retry</button>
            </div>
          ) : filteredTodos.length > 0 ? (
            <ul className='todo-list'>
              {filteredTodos.map((todo) => (
                <li key={todo.id} className={`todo-item ${todo.isCompleted ? 'todo-item--completed' : ''}`}>
                  <button
                    className={`todo-checkbox ${todo.isCompleted ? 'todo-checkbox--checked' : ''}`}
                    onClick={() => handleToggle(todo)}
                    type='button'
                    disabled={patching}
                    aria-label={todo.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {todo.isCompleted && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span className='todo-title'>{todo.text}</span>
                  <button
                    className='todo-delete-btn'
                    onClick={() => handleDelete(todo.id)}
                    type='button'
                    disabled={deleting}
                    aria-label='Delete todo'
                    title='Delete'
                  >
                    <img src="/close.svg" alt="Delete" width={14} height={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className='home-empty-state'>
              <img src="/empty.svg" alt="No todos" width={64} height={64} />
              <h3>No to-dos found</h3>
              <p>{filter !== 'all' ? 'Try a different filter' : 'Add your first to-do above'}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
