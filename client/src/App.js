import React, { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';
import Notes from './components/Notes/Notes';
import RadioButton from './components/RadioButton/RadioButton';

export default function App() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [selectedValue, setSelectedValue] = useState('all');

  useEffect(() => {
    getAllNotes();
  }, []);

  useEffect(() => {
    function enableSubmitButton() {
      let button = document.getElementById('button-submit');
      button.style.backgroundColor = '#ffd3ca';

      if (title && notes) {
        button.style.backgroundColor = '#eb8f7a';
      };
    }
    enableSubmitButton();
  }, [title, notes]);

  async function getAllNotes() {
    const response = await api.get('/annotations');

    setAllNotes(response.data);
  };

  async function loadNotes(option) {
    const params = { priority: option };
    const response = await api.get('/priorities', { params });

    if (response) {
      setAllNotes(response.data);
    };
  };

  function handleChange(e) {
    setSelectedValue(e.value);

    if (e.checked && e.value !== 'all') {
      loadNotes(e.value);
    } else {
      getAllNotes();
    };
  };

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await api.post('/annotations', {
      title,
      notes,
      priority: false
    });

    setTitle('');
    setNotes('');

    if (selectedValue !== 'all') {
      getAllNotes();
    } else {
      setAllNotes([...allNotes, response.data]);
    };

    setSelectedValue('all');
  };

  async function handleDelete(id) {
    const deletedNote = await api.delete(`/annotations/${id}`);

    if (deletedNote) {
      setAllNotes(allNotes.filter(note => note._id !== id));
    };
  };

  async function handleChangePriority(id) {
    const note = await api.post(`/priorities/${id}`);

    if (note && selectedValue !== 'all') {
      loadNotes(selectedValue);
    } else if (note) {
      getAllNotes();
    };
  };

  return (
    <div id="app">
      <aside>
        <strong>Notepad</strong>
        <form onSubmit={handleSubmit}>
          <div className="input-block">
            <label htmlFor="title">Annotation Title </label>
            <input required maxLength="30" value={title} onChange={event => setTitle(event.target.value)} />
          </div>
          <div className="input-block">
            <label htmlFor="note">Annotations </label>
            <textarea required value={notes} onChange={event => setNotes(event.target.value)}  ></textarea>
            <button id="button-submit" type="submit">Save</button>
          </div>
        </form>
        <RadioButton selectedValue={selectedValue} handleChange={handleChange} />
      </aside>
      <main>
        <ul>
          {allNotes.map(data => (
            <Notes key={data._id} data={data} handleDelete={handleDelete} handleChangePriority={handleChangePriority} />))}
        </ul>
      </main>
    </div>
  );
};