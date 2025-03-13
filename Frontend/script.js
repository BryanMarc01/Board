const socket = io("https://backend-devnotess.onrender.com");
const board = document.getElementById('board');

socket.on('loadNotes', notes => {
  board.innerHTML = '';
  notes.forEach(renderNote);
});

socket.on('newNote', renderNote);

socket.on('updateNote', updatedNote => {
  const noteEl = document.getElementById(updatedNote.id);
  if (noteEl) {
    noteEl.textContent = updatedNote.content;
    noteEl.style.transform = `translate(${updatedNote.x}px, ${updatedNote.y}px)`;
  }
});

socket.on('deleteNote', noteId => {
  document.getElementById(noteId)?.remove();
});

document.getElementById('addNote').onclick = () => {
  const content = prompt("Contenido de la nota:");
  if (!content) return;

  const note = { 
    id: Date.now().toString(), 
    content,
    x: 0,
    y: 0
  };

  socket.emit('newNote', note);
};

// Renderizar notas y habilitar Drag-and-Drop
function renderNote(note) {
  let noteEl = document.getElementById(note.id);

  if (!noteEl) {
    noteEl = document.createElement('div');
    noteEl.id = note.id;
    noteEl.className = 'bg-yellow-200 p-3 rounded shadow absolute cursor-move';
    noteEl.style.transform = `translate(${note.x}px, ${note.y}px)`;
    noteEl.textContent = note.content;

    board.appendChild(noteEl);

    interact(noteEl).draggable({
      listeners: {
        move(event) {
          note.x += event.dx;
          note.y += event.dy;
          event.target.style.transform = `translate(${note.x}px, ${note.y}px)`;
        },
        end() {
          socket.emit('updateNote', note);
        }
      }
    });

    // Editar o eliminar nota con doble clic
    noteEl.ondblclick = () => {
      const action = prompt("Escribe 'editar' para editar, 'borrar' para eliminar");

      if (action === 'editar') {
        const newContent = prompt("Editar nota:", note.content);
        if (newContent && newContent !== note.content) {
          note.content = newContent;
          socket.emit('updateNote', note);
        }
      } else if (action === 'borrar') {
        socket.emit('deleteNote', note.id);
        noteEl.remove();
      }
    };
  }
}
