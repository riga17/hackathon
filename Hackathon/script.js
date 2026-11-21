$(function () {
  const STORAGE_KEY = "priority-board-v1";
  const RANK = { high: 0, medium: 1, low: 2 };
  const LABEL = { high: "High", medium: "Medium", low: "Low" };

  const defaults = {
    now:   [{ id: 1, text: "Finish task 7 homework", priority: "high", done: false }],
    later: [{ id: 2, text: "Tidy desk", priority: "low", done: false }]
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.now && saved.later) return saved;
    } catch (e) { /* ignore */ }
    return defaults;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(readBoard())); } catch (e) { /* ignore */ }
  }

  // Build one <li> with safe text insertion
  function buildTask(t) {
    const $li = $("<li>", { class: "task" + (t.done ? " done" : ""), "data-id": t.id, "data-priority": t.priority });
    const $check = $("<input>", { type: "checkbox", class: "check", "aria-label": "Mark done" }).prop("checked", t.done);
    const $label = $("<span>", { class: "label" }).text(t.text);
    const $tag = $("<span>", { class: "tag" }).text(LABEL[t.priority]);
    const $del = $("<button>", { type: "button", class: "del", "aria-label": "Delete task" }).text("\u00d7");
    return $li.append($check, $label, $tag, $del);
  }

  function render(data) {
    ["now", "later"].forEach(function (col) {
      const $list = $("#" + col).empty();
      data[col].forEach(function (t) { $list.append(buildTask(t)); });
    });
    updateCounts();
  }

  // Read the current board state from the DOM (this is what drag & drop changes)
  function readBoard() {
    const out = { now: [], later: [] };
    ["now", "later"].forEach(function (col) {
      $("#" + col + " .task").each(function () {
        const $t = $(this);
        out[col].push({
          id: Number($t.attr("data-id")),
          text: $t.find(".label").text(),
          priority: $t.attr("data-priority"),
          done: $t.hasClass("done")
        });
      });
    });
    return out;
  }

  function updateCounts() {
    $("#count-now").text($("#now .task").length);
    $("#count-later").text($("#later .task").length);
  }

  function nextId() {
    const all = readBoard();
    const ids = all.now.concat(all.later).map(function (t) { return t.id; });
    return (ids.length ? Math.max.apply(null, ids) : 0) + 1;
  }

  // jQuery UI sortable: both lists are connected, so tasks can move between them
  $(".task-list").sortable({
    connectWith: ".task-list",
    items: "> .task",
    placeholder: "ph",
    tolerance: "pointer",
    cancel: "input, button",
    revert: 120,
    update: function () { updateCounts(); save(); }
  });

  // Add task
  $("#task-form").on("submit", function (e) {
    e.preventDefault();
    const text = $("#task-text").val().trim();
    if (!text) return;
    const task = {
      id: nextId(),
      text: text,
      priority: $("#task-priority").val(),
      done: false
    };
    $("#" + $("#task-column").val()).append(buildTask(task));
    $("#task-text").val("").trigger("focus");
    updateCounts();
    save();
  });

  // Complete / delete (event delegation, since tasks are created dynamically)
  $(".board").on("change", ".check", function () {
    $(this).closest(".task").toggleClass("done", this.checked);
    save();
  });
  $(".board").on("click", ".del", function () {
    $(this).closest(".task").remove();
    updateCounts();
    save();
  });

  // Sort a column by priority (high -> low), keeping order stable inside each level
  $(".sort-btn").on("click", function () {
    const $list = $("#" + $(this).data("target"));
    const items = $list.children(".task").get();
    items.sort(function (a, b) {
      const diff = RANK[$(a).attr("data-priority")] - RANK[$(b).attr("data-priority")];
      return diff !== 0 ? diff : items.indexOf(a) - items.indexOf(b);
    });
    $list.append(items);
    save();
  });

  $("#clear-done").on("click", function () {
    $(".task.done").remove();
    updateCounts();
    save();
  });

  render(load());
});
