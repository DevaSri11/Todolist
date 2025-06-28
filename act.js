  let stickyCount = 0;

  document.addEventListener("DOMContentLoaded", () => {
    loadAllItems();
  });

  function saveToLocalStorage(data) {
    localStorage.setItem("workspaceDiary", JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem("workspaceDiary");
    return data ? JSON.parse(data) : { tasks: [], stickyNotes: [] };
  }

  function loadAllItems() {
    const data = loadFromLocalStorage();
    data.tasks.forEach(task => createTaskBadge(task));
    data.stickyNotes.forEach(note => createStickyNote(note.content));
  }

  document.getElementById("addBtn").addEventListener("click", addBadge);

  function addBadge() {
    const input = document.getElementById("badgeInput");
    const text = input.value.trim();
    const dueDate = document.getElementById("taskDate").value;
    const category = document.querySelector("input[name='category']:checked");
    if (!text) {
        showToast("Please enter a task.");
        return;
    }

    if (!category) {
        showToast("Please select a category.");
        return;
    }

    if (!dueDate) {
        showToast("Please select a due date.");
        return;
    }

    const task = {
      id: Date.now(),
      text,
      category: category.value,
      dueDate,
      completed: false
    };

    const data = loadFromLocalStorage();
    data.tasks.push(task);
    saveToLocalStorage(data);

    createTaskBadge(task);

    input.value = "";
    document.getElementById("taskDate").value = "";
    document.querySelectorAll("input[name='category']").forEach(r => r.checked = false);
  }

  function createBadgeElement(task, isMainView, syncCallback, deleteCallback) {
    const today = new Date().toISOString().split("T")[0];
    const isOverdue = task.dueDate < today;

    const badge = document.createElement("span");
    badge.className = "badge-style";
    if (isOverdue) badge.style.backgroundColor = "#ffdddd";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input me-2";
    checkbox.checked = task.completed;

    const textSpan = document.createElement("span");
    textSpan.className = "text";
    if (task.completed) textSpan.classList.add("decoration");
    textSpan.innerHTML = `
      ${task.text} <span>- ${task.category}</span><br>
      <p style="color: #1e1e1e;font-size: large;"> Due: ${task.dueDate}</p>
      ${isOverdue ? '<br><small style="color: red;">⚠️ Overdue!</small>' : ''}
    `;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close ms-2";

    //sync
    checkbox.addEventListener("change", () => syncCallback(checkbox.checked, textSpan, badge));

    
    closeBtn.addEventListener("click", () => {
      badge.remove();
      deleteCallback();
    });

    badge.appendChild(checkbox);
    badge.appendChild(textSpan);
    badge.appendChild(closeBtn);

    return badge;
  }

  function createTaskBadge(task) {
    const container = document.getElementById("container");
    const personalCon = document.getElementById("personalcon");
    const workCon = document.getElementById("workcon");
    const impCon = document.getElementById("impcon");

    const deleteTask = () => {
   
    if (badgeMain) badgeMain.remove();
    if (badgeSide) badgeSide.remove();

    const data = loadFromLocalStorage();
    data.tasks = data.tasks.filter(t => t.id !== task.id);
    saveToLocalStorage(data);
    };

    let badgeMain, badgeSide;

    const syncBoth = (isChecked, textEl, badgeEl) => {
      const data = loadFromLocalStorage();
      const found = data.tasks.find(t => t.id === task.id);
      if (found) {
        found.completed = isChecked;
        saveToLocalStorage(data);
      }

      [badgeMain, badgeSide].forEach(b => {
        const cb = b.querySelector("input[type='checkbox']");
        const txt = b.querySelector(".text");

        cb.checked = isChecked;
        txt.classList.toggle("decoration", isChecked);
        b.style.backgroundColor = isChecked ? "#999" : (task.dueDate < new Date().toISOString().split("T")[0] ? "#ffdddd" : "#fffaf7");
        b.style.color = isChecked ? "#600000" : "#333";
      });
    };

    badgeMain = createBadgeElement(task, true, syncBoth, deleteTask);
    badgeSide = createBadgeElement(task, false, syncBoth, deleteTask);

    container.appendChild(badgeMain);
    if (task.category === "Personal") personalCon.appendChild(badgeSide);
    else if (task.category === "Work") workCon.appendChild(badgeSide);
    else impCon.appendChild(badgeSide);
  }

  function addStickyNote() {
    createStickyNote("");
  }

  function createStickyNote(content) {
    const grid = document.getElementById("stickyGrid");
    const card = document.createElement("div");
    card.className = "sticky-note";

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.className = "btn-close";

    const textarea = document.createElement("textarea");
    textarea.placeholder = `Note ${++stickyCount}...`;
    textarea.value = content;

    closeBtn.onclick = () => {
      card.remove();
      const data = loadFromLocalStorage();
      data.stickyNotes = data.stickyNotes.filter(n => n.content !== textarea.value.trim());
      saveToLocalStorage(data);
    };

    textarea.addEventListener("input", () => {
      const data = loadFromLocalStorage();
      const index = data.stickyNotes.findIndex(n => n.content === content);
      if (index !== -1) {
        data.stickyNotes[index].content = textarea.value;
      } else if (textarea.value.trim() !== "") {
        data.stickyNotes.push({ id: Date.now(), content: textarea.value });
      }
      saveToLocalStorage(data);
    });

    card.appendChild(closeBtn);
    card.appendChild(textarea);
    grid.appendChild(card);
  }
  function saveQuoteNote() {
  const quote = document.getElementById("quoteArea").value.trim();
  const display = document.getElementById("displayQuote");
  
  if (quote === "") {
    alert("Please write something!");
    return;
  }

  display.textContent = quote;
  document.getElementById("quoteArea").value = "";
}
function showToast(message) {
  const toastMsg = document.getElementById("toastMsg");
  toastMsg.textContent = message;
  const toastElement = new bootstrap.Toast(document.getElementById('liveToast'));
  toastElement.show();
}
