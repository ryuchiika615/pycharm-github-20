const labels = {
  kitchen: "\u30ad\u30c3\u30c1\u30f3",
  hall: "\u30db\u30fc\u30eb",
  manager: "\u5e97\u9577",
  veteran: "\u30d9\u30c6\u30e9\u30f3",
  middle: "\u4e2d\u5805",
  rookie: "\u65b0\u4eba",
  picked: "\u63a1\u7528",
  pick: "\u5165\u308c\u308b",
  people: "\u4eba",
  desired: "\u5e0c\u671b",
  decided: "\u6c7a\u5b9a",
  none: "\u5e0c\u671b\u8005\u306a\u3057",
  copied: "\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f"
};

const defaultStaff = [
  { id: 1, name: "\u68ee", section: "kitchen", level: 0, type: "\u5e97\u9577", max: 176, base: 120, pin: "1234", admin: true },
  { id: 2, name: "\u897f\u6751(\u512a)", section: "kitchen", level: 1, type: "\u4e00\u822c", max: 120, base: 58, pin: "1111" },
  { id: 3, name: "\u897f\u6751(\u6d77)", section: "kitchen", level: 1, type: "\u4e00\u822c", max: 120, base: 54, pin: "1111" },
  { id: 4, name: "\u7389\u7f6e", section: "kitchen", level: 1, type: "\u6276\u990a\u5185", max: 86, base: 44, pin: "1111" },
  { id: 5, name: "\u6cb3\u539f", section: "kitchen", level: 2, type: "\u4e00\u822c", max: 120, base: 36, pin: "1111" },
  { id: 6, name: "\u6749\u7530", section: "kitchen", level: 2, type: "\u4e00\u822c", max: 120, base: 42, pin: "1111" },
  { id: 7, name: "\u718a\u6fa4", section: "kitchen", level: 3, type: "\u9ad8\u6821\u751f", max: 40, base: 20, pin: "1111" },
  { id: 8, name: "\u6e21\u8fba", section: "hall", level: 1, type: "\u6276\u990a\u5185", max: 86, base: 48, pin: "1111" },
  { id: 9, name: "\u5b89\u90e8", section: "hall", level: 1, type: "\u4e00\u822c", max: 120, base: 52, pin: "1111" },
  { id: 10, name: "\u5317\u5ddd", section: "hall", level: 1, type: "\u6276\u990a\u5185", max: 86, base: 42, pin: "1111" },
  { id: 11, name: "\u672c\u6a4b", section: "hall", level: 1, type: "\u4e00\u822c", max: 120, base: 40, pin: "1111" },
  { id: 12, name: "\u65e9\u5ddd", section: "hall", level: 2, type: "\u4e00\u822c", max: 120, base: 32, pin: "1111" },
  { id: 13, name: "\u5de5\u85e4", section: "hall", level: 2, type: "\u4e00\u822c", max: 120, base: 30, pin: "1111" },
  { id: 14, name: "\u5c0f\u6797", section: "hall", level: 2, type: "\u9ad8\u6821\u751f", max: 40, base: 18, pin: "1111" },
  { id: 15, name: "\u95a2\u53e3", section: "hall", level: 2, type: "\u4e00\u822c", max: 120, base: 28, pin: "1111" },
  { id: 16, name: "\u5c71\u7530", section: "hall", level: 2, type: "\u4e00\u822c", max: 120, base: 34, pin: "1111" },
  { id: 17, name: "\u6c34\u672c", section: "hall", level: 3, type: "\u9ad8\u6821\u751f", max: 40, base: 16, pin: "1111" },
  { id: 18, name: "\u8494\u91ce", section: "hall", level: 3, type: "\u9ad8\u6821\u751f", max: 40, base: 14, pin: "1111" },
  { id: 19, name: "\u6d45\u6d77", section: "hall", level: 3, type: "\u9ad8\u6821\u751f", max: 40, base: 12, pin: "1111" },
  { id: 20, name: "\u7389\u5ddd", section: "hall", level: 3, type: "\u4e00\u822c", max: 120, base: 22, pin: "1111" },
  { id: 21, name: "\u5c0f\u6797(\u82bd)", section: "hall", level: 3, type: "\u9ad8\u6821\u751f", max: 40, base: 8, pin: "1111" }
];

let staff = load("shiftStaff", defaultStaff);
let wishes = load("shiftWishes", {});
let assignments = load("shiftAssignments", {});
let currentUser = null;
let selectedMonth = 6;
let period = "first";
let selectedDay = 1;
let cloud = null;
let cloudReady = false;

if (!staff.every((member) => member.pin) || !staff.some((member) => member.name === "\u5c0f\u6797(\u82bd)")) {
  staff = structuredClone(defaultStaff);
  wishes = {};
  assignments = {};
}

const $ = (selector) => document.querySelector(selector);
const monthSelect = $("#monthSelect");
const periodSelect = $("#periodSelect");
const daySelect = $("#daySelect");
const requiredPeople = $("#requiredPeople");
const shiftTable = $("#shiftTable");
const candidateList = $("#candidateList");
const exportText = $("#exportText");

function load(name, fallback) {
  try {
    return JSON.parse(localStorage.getItem(name)) || structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveAll() {
  localStorage.setItem("shiftStaff", JSON.stringify(staff));
  localStorage.setItem("shiftWishes", JSON.stringify(wishes));
  localStorage.setItem("shiftAssignments", JSON.stringify(assignments));
  if (cloudReady) {
    cloud
      .from("shift_state")
      .upsert({
        id: "main",
        data: { staff, wishes, assignments },
        updated_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) console.warn("Cloud save failed", error.message);
      });
  }
}

async function connectCloud() {
  const config = window.SHIFT_SUPABASE || {};
  if (!config.url || !config.anonKey || !window.supabase) return;
  cloud = window.supabase.createClient(config.url, config.anonKey);
  const { data, error } = await cloud.from("shift_state").select("data").eq("id", "main").maybeSingle();
  if (error) {
    console.warn("Cloud load failed", error.message);
    return;
  }
  if (data?.data) {
    staff = data.data.staff || staff;
    wishes = data.data.wishes || wishes;
    assignments = data.data.assignments || assignments;
  } else {
    await cloud.from("shift_state").insert({ id: "main", data: { staff, wishes, assignments } });
  }
  cloudReady = true;
}

function cloudLabel() {
  return cloudReady
    ? "\u30c7\u30fc\u30bf\u5171\u6709ON"
    : "\u8a66\u4f5c\u30e2\u30fc\u30c9\uff1a\u3053\u306e\u7aef\u672b\u306b\u4fdd\u5b58";
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function key(day = selectedDay) {
  return `2026-${pad(selectedMonth)}-${pad(day)}`;
}

function monthDays() {
  return new Date(2026, selectedMonth, 0).getDate();
}

function periodDays() {
  const start = period === "first" ? 1 : 16;
  const end = period === "first" ? 15 : monthDays();
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function weekday(day) {
  return ["\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"][new Date(2026, selectedMonth - 1, day).getDay()];
}

function dayClass(day) {
  if (weekday(day) === "\u65e5") return "sunday";
  if (weekday(day) === "\u571f") return "saturday";
  return "";
}

function isManager() {
  return Boolean(currentUser && currentUser.admin);
}

function sortedStaff() {
  return [...staff].sort((a, b) => {
    if (a.section !== b.section) return a.section === "kitchen" ? -1 : 1;
    if (a.level !== b.level) return Number(a.level) - Number(b.level);
    return a.id - b.id;
  });
}

function staffById(id) {
  return staff.find((member) => member.id === Number(id));
}

function getWish(day, staffId) {
  return (wishes[key(day)] || []).find((wish) => wish.staffId === Number(staffId));
}

function getAssignment(day, staffId) {
  return (assignments[key(day)] || []).find((item) => item.staffId === Number(staffId));
}

function hoursBetween(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh + em / 60 - (sh + sm / 60));
}

function staffHours(staffId) {
  return Object.values(assignments)
    .flat()
    .filter((item) => item.staffId === Number(staffId))
    .reduce((sum, item) => sum + hoursBetween(item.start, item.end), 0);
}

function risk(member, extra = 0) {
  const projected = member.base + staffHours(member.id) + extra;
  if (projected > member.max) return { className: "danger", text: `\u4e0a\u9650\u8d85\u3048 ${projected}h/${member.max}h` };
  if (projected > member.max * 0.9) return { className: "warn", text: `\u4e0a\u9650\u8fd1\u3044 ${projected}h/${member.max}h` };
  return { className: "ok", text: `${projected}h/${member.max}h` };
}

function normalizeText(text) {
  return text
    .replace(/[\uff10-\uff19]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[\u301c\uff5e~]/g, "~")
    .replace(/-/g, "~");
}

function parseWishText(text) {
  const clean = normalizeText(text);
  const results = [];
  const lines = clean.split(/\n/).map((line) => line.trim()).filter(Boolean);
  let pendingDays = [];

  for (const line of lines) {
    const days = [...line.matchAll(/(\d{1,2})\s*\u65e5/g)].map((match) => Number(match[1]));
    const startEnd = line.match(/(\d{1,2})\s*\u6642\s*~\s*(\d{1,2})?\s*\u6642?/);
    const startOnly = line.match(/(\d{1,2})\s*\u6642\s*~?/);
    const endOnly = line.match(/~\s*(\d{1,2})\s*\u6642/);

    if (days.length) pendingDays = days;

    if (pendingDays.length && startEnd) {
      addParsedDays(results, pendingDays, `${pad(Number(startEnd[1]))}:00`, startEnd[2] ? `${pad(Number(startEnd[2]))}:00` : "22:00");
      pendingDays = [];
    } else if (pendingDays.length && endOnly && !startOnly) {
      addParsedDays(results, pendingDays, "10:00", `${pad(Number(endOnly[1]))}:00`);
      pendingDays = [];
    } else if (pendingDays.length && startOnly) {
      addParsedDays(results, pendingDays, `${pad(Number(startOnly[1]))}:00`, "22:00");
      pendingDays = [];
    } else if (days.length) {
      addParsedDays(results, days, "10:00", "15:00");
      pendingDays = [];
    }
  }

  return results.filter((item) => item.day >= 1 && item.day <= monthDays());
}

function addParsedDays(results, days, start, end) {
  days.forEach((day) => results.push({ day, start, end }));
}

function addWish(member, day, start, end) {
  wishes[key(day)] ||= [];
  const list = wishes[key(day)];
  const existing = list.find((wish) => wish.staffId === member.id);
  if (existing) {
    existing.start = start;
    existing.end = end;
  } else {
    list.push({ staffId: member.id, start, end });
  }
}

function seedWishesIfEmpty() {
  if (Object.keys(wishes).length) return;
  const examples = [
    { id: 3, text: "1\u65e5\u30012\u65e5\u30015\u65e5\u30018\u65e5\u300110\u65e5\u300112\u65e5\n18\u6642~\n6\u65e5\u300113\u65e5 16\u6642~\n15\u65e5 11\u6642~" },
    { id: 20, text: "2\u65e5\u30014\u65e5\u30016\u65e5\u30017\u65e5\n9\u65e5\u300111\u65e5\u300114\u65e5 ~16\u6642" },
    { id: 4, text: "2\u65e5\u30013\u65e5\u30014\u65e5\u30019\u65e5\u300110\u65e5\u300111\u65e5\u300112\u65e5\n9\u6642~14\u6642" },
    { id: 17, text: "2\u65e57\u65e511\u65e513\u65e5" },
    { id: 18, text: "12\u65e5 18\u6642~\n13\u65e5\u300114\u65e5 16\u6642~" },
    { id: 10, text: "3\u65e5\u30016\u65e5\u30017\u65e5\u30018\u65e5\u300110\u65e5\u300113\u65e5\u300114\u65e5\u300115\u65e5\n10\u6642~14\u6642" }
  ];
  examples.forEach((example) => {
    const member = staffById(example.id);
    parseWishText(example.text).forEach((wish) => addWish(member, wish.day, wish.start, wish.end));
  });
  saveAll();
}

function renderLoginOptions() {
  const groups = {
    kitchen: sortedStaff().filter((member) => member.section === "kitchen"),
    hall: sortedStaff().filter((member) => member.section === "hall")
  };
  $("#loginUser").innerHTML = `
    <optgroup label="${labels.kitchen}">
      ${groups.kitchen.map((member) => `<option value="${member.id}">${member.name}</option>`).join("")}
    </optgroup>
    <optgroup label="${labels.hall}">
      ${groups.hall.map((member) => `<option value="${member.id}">${member.name}</option>`).join("")}
    </optgroup>
  `;
}

function renderSelectors() {
  monthSelect.innerHTML = [6, 7, 8].map((month) => `<option value="${month}">${month}\u6708</option>`).join("");
  monthSelect.value = selectedMonth;
  renderDaySelect();
}

function renderDaySelect() {
  daySelect.innerHTML = periodDays().map((day) => `<option value="${day}">${day}\u65e5</option>`).join("");
  if (!periodDays().includes(selectedDay)) selectedDay = periodDays()[0];
  daySelect.value = selectedDay;
}

function renderMode() {
  document.body.classList.toggle("locked", !isManager());
  $(".app-shell").style.display = currentUser ? "" : "none";
  document.querySelectorAll(".app-shell")[1].style.display = currentUser ? "" : "none";
  $("#loginScreen").style.display = currentUser ? "none" : "grid";
  if (!currentUser) return;
  $("#loginName").textContent = `${currentUser.name} / ${isManager() ? labels.manager : "\u30b9\u30bf\u30c3\u30d5"}`;
  $("#wishOwner").textContent = currentUser.name;
  $("#modeNotice").textContent = isManager()
    ? `\u5e97\u9577\u30e2\u30fc\u30c9\u3067\u3059\u3002\u8868\u3092\u62bc\u3057\u3066\u63a1\u7528\u30fb\u4e0d\u63a1\u7528\u3092\u5909\u3048\u3089\u308c\u307e\u3059\u3002${cloudLabel()}`
    : `\u81ea\u5206\u306e\u5e0c\u671b\u3092\u63d0\u51fa\u3067\u304d\u307e\u3059\u3002\u8868\u306e\u7de8\u96c6\u306f\u5e97\u9577\u3060\u3051\u3067\u3059\u3002${cloudLabel()}`;
}

function renderTable() {
  const days = periodDays();
  const rows = [];
  let lastSection = "";

  sortedStaff().forEach((member) => {
    if (member.section !== lastSection) {
      if (member.section === "hall") rows.push(blankRows(3, days.length + 1, "\u88fd\u9eba\u30fb\u30e1\u30e2"));
      rows.push(`<tr class="section-row"><td colspan="${days.length + 1}">${member.section === "kitchen" ? labels.kitchen : labels.hall}</td></tr>`);
      lastSection = member.section;
    }
    rows.push(`
      <tr>
        <td class="name-col">${member.name}</td>
        ${days.map((day) => renderShiftCell(day, member)).join("")}
      </tr>
    `);
  });
  rows.push(blankRows(2, days.length + 1, "\u58f2\u4e0a\u30fb\u30e1\u30e2"));

  shiftTable.innerHTML = `
    <thead>
      <tr><th class="name-col">\u66dc\u65e5</th>${days.map((day) => `<th class="${dayClass(day)}">${weekday(day)}</th>`).join("")}</tr>
      <tr><th class="name-col">\u540d\u524d</th>${days.map((day) => `<th class="${dayClass(day)}">${day}</th>`).join("")}</tr>
    </thead>
    <tbody>${rows.join("")}</tbody>
  `;

  const totalWishes = days.reduce((sum, day) => sum + (wishes[key(day)] || []).length, 0);
  const totalAssigned = days.reduce((sum, day) => sum + (assignments[key(day)] || []).length, 0);
  $("#boardSummary").textContent = `${labels.desired} ${totalWishes}${labels.people} / ${labels.decided} ${totalAssigned}${labels.people}`;
}

function blankRows(count, colspan, label) {
  return Array.from({ length: count }, (_, index) => `
    <tr class="memo-row">
      <td class="name-col">${index === 0 ? label : ""}</td>
      ${Array.from({ length: colspan - 1 }, () => "<td></td>").join("")}
    </tr>
  `).join("");
}

function renderShiftCell(day, member) {
  const wish = getWish(day, member.id);
  const assigned = getAssignment(day, member.id);
  const clickable = wish ? `data-day="${day}" data-id="${member.id}"` : "";
  if (assigned) return `<td class="cell assigned" ${clickable}>${assigned.start.replace(":00", "")}<br>${assigned.end.replace(":00", "")}</td>`;
  if (wish) return `<td class="cell rejected" ${clickable}>-</td>`;
  return `<td class="cell unavailable"></td>`;
}

function renderCandidates() {
  const list = wishes[key()] || [];
  const assigned = assignments[key()] || [];
  $("#dayTitle").textContent = `${selectedMonth}\u6708${selectedDay}\u65e5\u306e\u5e0c\u671b`;
  $("#coverageBadge").textContent = `${assigned.length}/${requiredPeople.value}${labels.people}`;
  $("#coverageBadge").className = `badge ${assigned.length >= Number(requiredPeople.value) ? "ok" : "danger"}`;

  candidateList.innerHTML = list.length
    ? list.map(renderCandidate).join("")
    : `<div class="meta">${labels.none}</div>`;
}

function renderCandidate(wish) {
  const member = staffById(wish.staffId);
  const picked = Boolean(getAssignment(selectedDay, member.id));
  const tag = risk(member, picked ? 0 : hoursBetween(wish.start, wish.end));
  return `
    <article class="candidate-card ${picked ? "selected" : ""}">
      <div class="row">
        <div>
          <div class="name">${member.name}</div>
          <div class="meta">${member.section === "kitchen" ? labels.kitchen : labels.hall} / ${member.type}</div>
        </div>
        <span class="tag ${tag.className}">${tag.text}</span>
      </div>
      <div class="candidate-actions manager-only">
        <input type="time" value="${wish.start}" data-action="start" data-id="${member.id}" />
        <input type="time" value="${wish.end}" data-action="end" data-id="${member.id}" />
        <button class="select-button ${picked ? "selected" : ""}" data-action="toggle" data-id="${member.id}">
          ${picked ? labels.picked : labels.pick}
        </button>
      </div>
    </article>
  `;
}

function renderStaffList() {
  $("#staffCount").textContent = `${staff.length}${labels.people}`;
  $("#staffList").innerHTML = sortedStaff().map((member) => {
    const tag = risk(member);
    const level = member.level === 0 ? labels.manager : member.level === 1 ? labels.veteran : member.level === 2 ? labels.middle : labels.rookie;
    return `
      <article class="staff-card">
        <div class="row">
          <span class="name">${member.name}</span>
          <span class="tag ${tag.className}">${tag.text}</span>
        </div>
        <div class="meta">${member.section === "kitchen" ? labels.kitchen : labels.hall} / ${level} / ${member.type}</div>
        ${isManager() ? `<button class="edit-member manager-only" data-id="${member.id}">\u7de8\u96c6</button>` : ""}
      </article>
    `;
  }).join("");
}

function renderExport() {
  const lines = [];
  periodDays().forEach((day) => {
    (assignments[key(day)] || []).forEach((item) => {
      lines.push(`${selectedMonth}/${day},${staffById(item.staffId).name},${item.start},${item.end}`);
    });
  });
  exportText.value = lines.join("\n");
}

function renderAll() {
  renderLoginOptions();
  renderMode();
  if (!currentUser) return;
  renderTable();
  renderCandidates();
  renderStaffList();
  renderExport();
}

function toggleAssignment(day, staffId) {
  if (!isManager()) return;
  assignments[key(day)] ||= [];
  const list = assignments[key(day)];
  const index = list.findIndex((item) => item.staffId === staffId);
  if (index >= 0) list.splice(index, 1);
  else {
    const wish = getWish(day, staffId);
    if (wish) list.push({ staffId, start: wish.start, end: wish.end });
  }
  saveAll();
  renderAll();
}

function autoPick() {
  if (!isManager()) return;
  const required = Number(requiredPeople.value);
  periodDays().forEach((day) => {
    assignments[key(day)] = [...(wishes[key(day)] || [])]
      .sort((a, b) => staffById(a.staffId).level - staffById(b.staffId).level)
      .slice(0, required)
      .map((wish) => ({ staffId: wish.staffId, start: wish.start, end: wish.end }));
  });
  saveAll();
  renderAll();
}

function updateWishTime(staffId, field, value) {
  if (!isManager()) return;
  const wish = getWish(selectedDay, staffId);
  if (wish) wish[field] = value;
  const assignment = getAssignment(selectedDay, staffId);
  if (assignment) assignment[field] = value;
  saveAll();
  renderAll();
}

function clearMemberForm() {
  $("#memberId").value = "";
  $("#memberName").value = "";
  $("#memberSection").value = "hall";
  $("#memberLevel").value = "3";
  $("#memberPin").value = "1111";
}

function editMember(id) {
  const member = staffById(id);
  $("#memberId").value = member.id;
  $("#memberName").value = member.name;
  $("#memberSection").value = member.section;
  $("#memberLevel").value = member.level;
  $("#memberPin").value = member.pin;
}

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const user = staffById($("#loginUser").value);
  if (!user || user.pin !== $("#loginPassword").value) {
    $("#loginError").textContent = "\u540d\u524d\u304b\u30d1\u30b9\u30ef\u30fc\u30c9\u304c\u9055\u3044\u307e\u3059\u3002";
    return;
  }
  currentUser = user;
  $("#loginPassword").value = "";
  $("#loginError").textContent = "";
  renderAll();
});

$("#logoutButton").addEventListener("click", () => {
  currentUser = null;
  renderAll();
});

monthSelect.addEventListener("change", (event) => {
  selectedMonth = Number(event.target.value);
  renderDaySelect();
  renderAll();
});

periodSelect.addEventListener("change", (event) => {
  period = event.target.value;
  renderDaySelect();
  renderAll();
});

daySelect.addEventListener("change", (event) => {
  selectedDay = Number(event.target.value);
  renderAll();
});

requiredPeople.addEventListener("change", renderAll);
$("#autoPickButton").addEventListener("click", autoPick);

shiftTable.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-day][data-id]");
  if (!cell) return;
  selectedDay = Number(cell.dataset.day);
  daySelect.value = selectedDay;
  if (isManager()) toggleAssignment(selectedDay, Number(cell.dataset.id));
  else renderAll();
});

candidateList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='toggle']");
  if (button) toggleAssignment(selectedDay, Number(button.dataset.id));
});

candidateList.addEventListener("change", (event) => {
  const input = event.target;
  if (input.dataset.action) updateWishTime(Number(input.dataset.id), input.dataset.action, input.value);
});

$("#wishForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentUser) return;
  parseWishText($("#wishText").value).forEach((wish) => addWish(currentUser, wish.day, wish.start, wish.end));
  $("#wishText").value = "";
  saveAll();
  renderAll();
});

$("#memberForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isManager()) return;
  const id = Number($("#memberId").value);
  const data = {
    name: $("#memberName").value.trim(),
    section: $("#memberSection").value,
    level: Number($("#memberLevel").value),
    pin: $("#memberPin").value.trim(),
    admin: Number($("#memberLevel").value) === 0
  };
  if (!/^\d{4}$/.test(data.pin) || !data.name) return;
  if (id) {
    const member = staffById(id);
    Object.assign(member, data);
  } else {
    staff.push({ id: Math.max(...staff.map((member) => member.id)) + 1, type: "\u4e00\u822c", max: 120, base: 0, ...data });
  }
  currentUser = staffById(currentUser.id);
  clearMemberForm();
  saveAll();
  renderAll();
});

$("#clearMemberButton").addEventListener("click", clearMemberForm);

$("#staffList").addEventListener("click", (event) => {
  const button = event.target.closest(".edit-member");
  if (button) editMember(Number(button.dataset.id));
});

$("#copyButton").addEventListener("click", async () => {
  await navigator.clipboard.writeText(exportText.value);
  $("#copyButton").textContent = labels.copied;
  setTimeout(() => ($("#copyButton").textContent = "\u8868\u3092\u30b3\u30d4\u30fc"), 1200);
});

async function initApp() {
  renderSelectors();
  clearMemberForm();
  seedWishesIfEmpty();
  await connectCloud();
  renderAll();
}

initApp();
