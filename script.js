// Complete Bible books list
const books = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation"
];

// Actual chapter counts for each book
const chapterCounts = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150,
  31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16,
  24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1,
  22
];

let selected = 0; // Index of the currently selected book (0 = Genesis)
let chapter = 1; // Currently selected chapter number
let activeFilter = "all"; // 'all', 'old', or 'new'
let searchQuery = "";

const list = document.getElementById("bookList");
const searchInput = document.getElementById("bookSearch");
const chapterSelect = document.getElementById("chapterSelect");

// 1. RENDER BOOK LIST (With Search and Testament Tab filtering logic)
function render() {
  if (!list) return;

  list.innerHTML = books
    .map((b, i) => {
      const isOldTestament = i < 39;

      if (activeFilter === "old" && !isOldTestament) return "";
      if (activeFilter === "new" && isOldTestament) return "";
      if (searchQuery && !b.toLowerCase().includes(searchQuery)) return "";

      return `<button class="book-option ${i === selected ? "selected" : ""}" data-i="${i}">${b}</button>`;
    })
    .join("");
}

// 2. BOOK CLICK EVENT
if (list) {
  list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) {
      selected = +b.dataset.i;
      chapter = 1;
      updateUI();
      render();
    }
  });
}

// 3. UPDATE ALL DISPLAY INTERFACE COMPONENT FIELDS
function updateUI() {
  const name = books[selected];
  const totalChapters = chapterCounts[selected] || 1;

  if (chapter > totalChapters) chapter = totalChapters;
  if (chapter < 1) chapter = 1;

  if (document.getElementById("chapterBook"))
    document.getElementById("chapterBook").textContent = name;
  if (document.getElementById("currentBookCrumb"))
    document.getElementById("currentBookCrumb").textContent =
      name.toUpperCase();
  if (document.getElementById("chapterNumber"))
    document.getElementById("chapterNumber").textContent = chapter;

  if (document.getElementById("testamentLabel")) {
    document.getElementById("testamentLabel").textContent =
      selected < 39 ? "THE OLD TESTAMENT" : "THE NEW TESTAMENT";
  }

  if (chapterSelect) {
    chapterSelect.innerHTML = Array.from(
      { length: totalChapters },
      (_, i) => `<option value="${i + 1}">${i + 1}</option>`
    ).join("");
    chapterSelect.value = chapter;
  }

  renderVerses();
}

// 4. LIVE API VERSE PARSER (Fetches complete KJV scriptures over the web)
function renderVerses() {
  const verseElem = document.getElementById("verseContent");
  if (!verseElem) return;

  const currentBook = books[selected];
  const currentChapter = chapter;

  // Show loading indicator
  verseElem.innerHTML = `<p class="verse status-text">Loading ${currentBook} ${currentChapter}...</p>`;

  // API URL targeting the free, open Bible API
  const apiUrl = `https://bible-api.com{encodeURIComponent(currentBook)}+${currentChapter}?translation=kjv`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Scripture data unavailable");
      return response.json();
    })
    .then((data) => {
      // Safety guard: ensure user hasn't switched chapters while waiting
      if (currentBook !== books[selected] || currentChapter !== chapter) return;

      if (!data.verses || data.verses.length === 0) {
        verseElem.innerHTML = `<p class="verse status-text">No verses found for this chapter.</p>`;
        return;
      }

      // Map out each real verse string directly into the viewport layout
      verseElem.innerHTML = data.verses
        .map((v) => {
          return `<p class="verse"><sup>${v.verse}</sup> ${v.text.trim()}</p>`;
        })
        .join("");
    })
    .catch((error) => {
      console.error("Bible API Fetch Error:", error);
      verseElem.innerHTML = `
        <p class="verse status-text error-text">
          ⚠️ Unable to load scripture reading. Please check your connection or try again.
        </p>
      `;
    });
}

// 5. ATTACH ALL NAVIGATION COMPONENT LISTENERS SAFEGUARDS
if (chapterSelect) {
  chapterSelect.onchange = (e) => {
    chapter = +e.target.value;
    updateUI();
  };
}

// Chapter Navigation Triggers
function adjustChapter(amount) {
  const totalChapters = chapterCounts[selected] || 1;
  let newChapter = chapter + amount;

  if (newChapter > totalChapters) {
    if (selected < books.length - 1) {
      selected++;
      chapter = 1;
    }
  } else if (newChapter < 1) {
    if (selected > 0) {
      selected--;
      chapter = chapterCounts[selected];
    }
  } else {
    chapter = newChapter;
  }

  updateUI();
  render();
}

const bindClick = (id, callback) => {
  const el = document.getElementById(id);
  if (el) el.onclick = callback;
};

bindClick("previousChapter", () => adjustChapter(-1));
bindClick("nextChapter", () => adjustChapter(1));
bindClick("footerPrevious", () => adjustChapter(-1));
bindClick("footerNext", () => adjustChapter(1));

// Testament Tab Filters
document.querySelectorAll(".testament-tab").forEach((button) => {
  button.onclick = () => {
    document
      .querySelectorAll(".testament-tab")
      .forEach((x) => x.classList.toggle("selected", x === button));
    activeFilter = button.getAttribute("data-testament") || "all";
    render();
  };
});

// Real-time Interactive Text Search Field
if (searchInput) {
  searchInput.oninput = (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  };
}

// Bookmark Notification Trigger
bindClick("bookmarkButton", () => {
  const savedMsg = document.getElementById("savedMessage");
  if (savedMsg) {
    savedMsg.textContent = `Saved ${books[selected]} Chapter ${chapter} to your library.`;
    savedMsg.classList.add("visible");
    setTimeout(() => savedMsg.classList.remove("visible"), 3000);
  }
});

// Daily Card Action Hook Link
bindClick("openDaily", (e) => {
  e.preventDefault();
  selected = 18; // Psalms index
  chapter = 46; // Psalm 46
  updateUI();
  render();
  document.getElementById("read").scrollIntoView({ behavior: "smooth" });
});

// 6. DYNAMIC SYSTEM CLOCK INITIALIZATION
const dateChip = document.getElementById("todayDate");
if (dateChip) {
  const options = { weekday: "short", month: "short", day: "numeric" };
  dateChip.textContent = new Date()
    .toLocaleDateString("en-US", options)
    .toUpperCase();
}

// Initial Boot Cycle
render();
updateUI();
