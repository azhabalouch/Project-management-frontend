import { useState } from 'react';
import { useNoteContext } from '../context/NoteContext';
import { usePost } from '../hooks/usePost';
import { usePatch } from '../hooks/usePatch';
import { useDelete } from '../hooks/useDelete';
import { NOTE_URLS } from '../apis';
import { useToast } from '../context/ToastContext';
import type { DateNote, HandleSubmitEvent } from '../components/type/typesInterface';
import { CloseIcon, EditIcon, Trash2, EmptyStateIcon, ErrorIcon } from '../components/Icons';
import Layout from '../components/Layout';

const COLOR_OPTIONS = [
  { label: 'Amber', value: '#D27D2D' },
  { label: 'Red', value: '#E53E3E' },
  { label: 'Green', value: '#38A169' },
  { label: 'Blue', value: '#3182CE' },
  { label: 'Purple', value: '#805AD5' },
  { label: 'Pink', value: '#D53F8C' },
  { label: 'Teal', value: '#319795' },
  { label: 'Gray', value: '#718096' },
];

interface NoteFormData {
  date: string;
  color: string;
  text: string;
}

export default function Notes() {
  const { notes, loading, error, refreshNotes, updateNote, removeNote } = useNoteContext();
  const { execute: createNote, loading: creating } = usePost(NOTE_URLS.create);
  const { execute: patchNote, loading: patching } = usePatch(NOTE_URLS.patch);
  const { remove: deleteNote, loading: deleting } = useDelete(NOTE_URLS.delete);
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NoteFormData>({
    date: new Date().toISOString().split('T')[0],
    color: '#D27D2D',
    text: '',
  });

  const resetForm = () => {
    setFormData({ date: new Date().toISOString().split('T')[0], color: '#D27D2D', text: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (note: DateNote) => {
    setFormData({ date: note.date, color: note.color, text: note.text });
    setEditingId(note.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!formData.text.trim() || !formData.date) return;

    if (editingId) {
      const result = await patchNote({
        noteId: editingId,
        date: formData.date,
        color: formData.color,
        text: formData.text.trim(),
      });
      if (result) {
        updateNote(editingId, {
          id: editingId,
          date: formData.date,
          color: formData.color,
          text: formData.text.trim(),
          createdAt: notes.find((n) => n.id === editingId)?.createdAt ?? '',
          updatedAt: new Date().toISOString(),
        });
        addToast('Note updated', 'success');
        resetForm();
      }
    } else {
      const result = await createNote({
        date: formData.date,
        color: formData.color,
        text: formData.text.trim(),
      });
      if (result) {
        await refreshNotes();
        addToast('Note created', 'success');
        resetForm();
      }
    }
  };

  const handleDelete = async (noteId: string) => {
    const result = await deleteNote({ noteId });
    if (result) {
      removeNote(noteId);
      addToast('Note deleted', 'info');
    }
  };

  const sortedNotes = [...notes].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Layout>
      <section className='home-content'>
        <div className='home-header'>
          <div className='home-header-title-container'>
            <h1 className='home-header-title'>Notes</h1>
            <span className='home-task-count'>{notes.length} notes</span>
          </div>
          <button
            className='btn-primary'
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + New Note
          </button>
        </div>

        {showForm && (
          <div className='modal-backdrop' onClick={() => resetForm()}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <div className='modal-header'>
                <h2>{editingId ? 'Edit Note' : 'New Note'}</h2>
                <button className='modal-close-btn' onClick={resetForm}>
                  <CloseIcon size={18} />
                </button>
              </div>
              <form className='modal-form' onSubmit={handleSubmit}>
                <div className='form-group'>
                  <label>Date</label>
                  <input
                    type='date'
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className='form-group'>
                  <label>Color</label>
                  <div className='note-color-picker'>
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        className={`note-color-swatch${formData.color === opt.value ? ' selected' : ''}`}
                        style={{ backgroundColor: opt.value }}
                        onClick={() => setFormData((prev) => ({ ...prev, color: opt.value }))}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>
                <div className='form-group'>
                  <label>Note</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder='Write your note...'
                    rows={4}
                  />
                </div>
                <div className='modal-actions'>
                  <button type='submit' className='btn-primary' disabled={creating || patching}>
                    {creating || patching ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                  <button type='button' className='btn-ghost' onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className='home-loading-state'>
            <div className='loading-spinner'></div>
            <p>Loading notes...</p>
          </div>
        ) : error ? (
          <div className='home-error-state'>
            <ErrorIcon size={48} />
            <p>Unable to load notes. Please try again.</p>
            <button className='btn-primary' onClick={refreshNotes}>Retry</button>
          </div>
        ) : sortedNotes.length > 0 ? (
          <ul className='note-list'>
            {sortedNotes.map((note) => (
              <li key={note.id} className='note-item'>
                <div className='note-item-color' style={{ backgroundColor: note.color }} />
                <div className='note-item-body'>
                  <div className='note-item-date'>{note.date}</div>
                  <div className='note-item-text'>{note.text}</div>
                </div>
                <div className='note-item-actions'>
                  <button className='note-action-btn' onClick={() => startEdit(note)} title='Edit'>
                    <EditIcon size={16} />
                  </button>
                  <button
                    className='note-action-btn note-action-btn--danger'
                    onClick={() => handleDelete(note.id)}
                    title='Delete'
                    disabled={deleting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='home-empty-state'>
            <EmptyStateIcon size={64} />
            <h3>No notes yet</h3>
            <p>Create your first note to mark important dates</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
