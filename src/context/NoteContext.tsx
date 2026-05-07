import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NOTE_URLS } from '../apis';
import type { DateNote, NoteContextValue } from '../components/type/typesInterface';

export const NoteContext = createContext<NoteContextValue | undefined>(undefined);

interface NoteProviderProps {
  children: ReactNode;
}

export const normalizeNote = (note: any): DateNote => ({
  id: String(note.id),
  date: String(note.date ?? ''),
  color: String(note.color ?? '#D27D2D'),
  text: String(note.text ?? ''),
  createdAt: String(note.createdAt ?? ''),
  updatedAt: String(note.updatedAt ?? ''),
});

const normalizeNotes = (notes: unknown): DateNote[] => {
  return Array.isArray(notes) ? notes.map(normalizeNote) : [];
};

export const NoteProvider = ({ children }: NoteProviderProps) => {
  const [notes, setNotes] = useState<DateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshNotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(NOTE_URLS.get, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setNotes(normalizeNotes(Array.isArray(data) ? data : []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshNotes();
  }, [refreshNotes]);

  const addNote = useCallback((note: DateNote) => {
    setNotes((current) => [...current, normalizeNote(note)]);
  }, []);

  const updateNote = useCallback((noteId: string, updatedNote: DateNote) => {
    setNotes((current) =>
      current.map((n) => (n.id === noteId ? normalizeNote(updatedNote) : n))
    );
  }, []);

  const removeNote = useCallback((noteId: string) => {
    setNotes((current) => current.filter((n) => n.id !== noteId));
  }, []);

  return (
    <NoteContext.Provider
      value={{
        notes,
        loading,
        error,
        refreshNotes,
        addNote,
        updateNote,
        removeNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};
