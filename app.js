const labels = {
  kitchen: "\u30ad\u30c3\u30c1\u30f3",
  hall: "\u30db\u30fc\u30eb",
  manager: "\u5e97\u9577",
  picked: "\u63a1\u7528",
  pick: "\u5165\u308c\u308b",
  people: "\u4eba",
  desired: "\u5e0c\u671b",
  decided: "\u6c7a\u5b9a",
  none: "\u5e0c\u671b\u8005\u306a\u3057",
  copied: "\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f"
};

const defaultStaff = [
  { id: 1, name: "\u5e97\u9577", section: "manager", sort: 0, type: "\u7ba1\u7406\u8005", max: 176, base: 0, pin: "1234", admin: true },
  { id: 2, name: "\u68ee", section: "kitchen", sort: 1, type: "\u4e00\u822c", max: 120, base: 58, pin: "1111" },
  { id: 3, name: "\u897f\u6751(\u512a)", section: "kitchen", sort: 2, type: "\u4e00\u822c", max: 120, base: 58, pin: "1111" },
  { id: 4, name: "\u897f\u6751(\u6d77)", section: "kitchen", sort: 3, type: "\u4e00\u822c", max: 120, base: 54, pin: "1111" },
  { id: 5, name: "\u7389\u7f6e", section: "kitchen", sort: 4, type: "\u6276\u990a\u5185", max: 86, base: 44, pin: "1111" },
  { id: 6, name: "\u6cb3\u539f", section: "kitchen", sort: 5, type: "\u4e00\u822c", max: 120, base: 36, pin: "1111" },
  { id: 7, name: "\u6749\u7530", section: "kitchen", sort: 6, type: "\u4e00\u822c", max: 120, base: 42, pin: "1111" },
  { id: 8, name: "\u718a\u6fa4", section: "kitchen", sort: 7, type: "\u9ad8\u6821\u751f", max: 40, base: 20, pin: "1111" },
  { id: 9, name: "\u6e21\u8fba", section: "hall", sort: 1, type: "\u6276\u990a\u5185", max: 86, base: 48, pin: "1111" },
  { id: 10, name: "\u5b89\u90e8", section: "hall", sort: 2, type: "\u4e00\u822c", max: 120, base: 52, pin: "1111" },
  { id: 11, name: "\u5317\u5ddd", section: "hall", sort: 3, type: "\u6276\u990a\u5185", max: 86, base: 42, pin: "1111" },
  { id: 12, name: "\u672c\u6a4b", section: "hall", sort: 4, type: "\u4e00\u822c", max: 120, base: 40, pin: "1111" },
  { id: 13, name: "\u65e9\u5ddd", section: "hall", sort: 5, type: "\u4e00\u822c", max: 120, base: 32, pin: "1111" },
  { id: 14, name: "\u5de5\u85e4", section: "hall", sort: 6, type: "\u4e00\u822c", max: 120, base: 30, pin: "1111" },
  { id: 15, name: "\u5c0f\u6797", section: "hall", sort: 7, type: "\u9ad8\u6821\u751f", max: 40, base: 18, pin: "1111" },
  { id: 16, name: "\u95a2\u53e3", section: "hall", sort: 8, type: "\u4e00\u822c", max: 120, base: 28, pin: "1111" },
  { id: 17, name: "\u5c71\u7530", section: "hall", sort: 9, type: "\u4e00\u822c", max: 120, base: 34, pin: "1111" },
  { id: 18, name: "\u6c34\u672c", section: "hall", sort: 10, type: "\u9ad8\u6821\u751f", max: 40, base: 16, pin: "1111" },
  { id: 19, name: "\u8494\u91ce", section: "hall", sort: 11, type: "\u9ad8\u6821\u751f", max: 40, base: 14, pin: "1111" },
  { id: 20, name: "\u6d45\u6d77", section: "hall", sort: 12, type: "\u9ad8\u6821\u751f", max: 40, base: 12, pin: "1111" },
  { id: 21, name: "\u7389\u5ddd", section: "hall", sort: 13, type: "\u4e00\u822c", max: 120, base: 22, pin: "1111" },
  { id: 22, name: "\u5c0f\u6797(\u82bd)", section: "hall", sort: 14, type: "\u9ad8\u6821\u751f", max: 40, base: 8, pin: "1111" }
];

let staff = load("shiftStaff", defaultStaff);
let wishes = load("shiftWishes", {});
let assignments = load("shiftAssignments", {});
let noodleAssignments = load("shiftNoodleAssignments", {});
let salesNotes = load("shiftSalesNotes", {});
let reportNotes = load("shiftReportNotes", {});
let currentUser = null;
let selectedMonth = 6;
let period = "first";
let selectedDay = 1;
let cloud = null;
let cloudReady = false;

function resetRosterIfOutdated() {
  if (!staff.every((member) => member.pin) || !staff.some((member) => member.name === "\u5e97\u9577") || staff.some((member) => "level" in member)) {
    staff = structuredClone(defaultStaff);
    wishes = {};
    assignments = {};
  }
}

resetRosterIfOutdated();

const $ = (selector) => document.querySelector(selector);
const monthSelect = $("#monthSelect");
const periodSelect = $("#periodSelect");
const daySelect = $("#daySelect");
const requiredMorning = $("#requiredMorning");
const requiredEvening = $("#requiredEvening");
const shiftTable = $("#shiftTable");
const candidateList = $("#candidateList");
const exportText = $("#exportText");
const openTime = "09:00";
const closeTime = "22:00";
const topReportRows = [
  { id: "salesBudget", label: "\u58f2\u4e0a\u4e88\u7b97" },
  { id: "lastYearSales", label: "\u524d\u5e74\u58f2\u4e0a" },
  { id: "yearRate", label: "\u524d\u5e74\u6bd4" },
  { id: "lastYearShiftSales", label: "\u524d\u5e74\u30b7\u30d5\u30c8\u58f2\u4e0a" },
  { id: "lunchPeople", label: "\u30e9\u30f3\u30c1\u4eba\u54e1" },
  { id: "dinnerPeople", label: "\u30c7\u30a3\u30ca\u30fc\u4eba\u54e1" }
];
const bottomReportRows = [
  { id: "workHours", label: "\u52b4\u50cd\u6642\u9593" },
  { id: "employeeHours", label: "\u793e\u54e1\u52b4\u50cd\u6642\u9593" },
  { id: "partTimeHours", label: "AP\u6642\u9593" },
  { id: "laborCost", label: "\u4eba\u4ef6\u8cbb" },
  { id: "laborCostRate", label: "\u4eba\u4ef6\u8cbb\u7387" },
  { id: "salesPerHour", label: "\u4eba\u6642\u58f2\u4e0a" },
  { id: "lStaff", label: "L\u30b9\u30bf\u30c3\u30d5" },
  { id: "dStaff", label: "D\u30b9\u30bf\u30c3\u30d5" }
];

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
  localStorage.setItem("shiftNoodleAssignments", JSON.stringify(noodleAssignments));
  localStorage.setItem("shiftSalesNotes", JSON.stringify(salesNotes));
  localStorage.setItem("shiftReportNotes", JSON.stringify(reportNotes));
  if (cloudReady) {
    cloud
      .from("shift_state")
      .upsert({
        id: "main",
        data: { staff, wishes, assignments, noodleAssignments, salesNotes, reportNotes },
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
  cloudReady = true;
  if (data?.data) {
    staff = data.data.staff || staff;
    wishes = data.data.wishes || wishes;
    assignments = data.data.assignments || assignments;
    noodleAssignments = data.data.noodleAssignments || noodleAssignments;
    salesNotes = data.data.salesNotes || salesNotes;
    reportNotes = data.data.reportNotes || reportNotes;
    resetRosterIfOutdated();
    saveAll();
  } else {
    await cloud.from("shift_state").insert({ id: "main", data: { staff, wishes, assignments, noodleAssignments, salesNotes, reportNotes } });
  }
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
    const order = { manager: 0, kitchen: 1, hall: 2 };
    if (a.section !== b.section) return order[a.section] - order[b.section];
    if (a.sort !== b.sort) return Number(a.sort) - Number(b.sort);
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

function workStaff() {
  return sortedStaff().filter((member) => member.section !== "manager");
}

function hoursBetween(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh + em / 60 - (sh + sm / 60));
}

function minutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function overlaps(item, start, end) {
  return minutes(item.start) < minutes(end) && minutes(item.end) > minutes(start);
}

function canEditWish(staffId) {
  return isManager() || currentUser?.id === Number(staffId);
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
      addParsedDays(results, pendingDays, openTime, `${pad(Number(endOnly[1]))}:00`);
      pendingDays = [];
    } else if (pendingDays.length && startOnly) {
      addParsedDays(results, pendingDays, `${pad(Number(startOnly[1]))}:00`, "22:00");
      pendingDays = [];
    } else if (days.length) {
      addParsedDays(results, days, openTime, closeTime);
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
    { id: 4, text: "1\u65e5\u30012\u65e5\u30015\u65e5\u30018\u65e5\u300110\u65e5\u300112\u65e5\n18\u6642~\n6\u65e5\u300113\u65e5 16\u6642~\n15\u65e5 11\u6642~" },
    { id: 21, text: "2\u65e5\u30014\u65e5\u30016\u65e5\u30017\u65e5\n9\u65e5\u300111\u65e5\u300114\u65e5 ~16\u6642" },
    { id: 5, text: "2\u65e5\u30013\u65e5\u30014\u65e5\u30019\u65e5\u300110\u65e5\u300111\u65e5\u300112\u65e5\n9\u6642~14\u6642" },
    { id: 18, text: "2\u65e57\u65e511\u65e513\u65e5" },
    { id: 19, text: "12\u65e5 18\u6642~\n13\u65e5\u300114\u65e5 16\u6642~" },
    { id: 11, text: "3\u65e5\u30016\u65e5\u30017\u65e5\u30018\u65e5\u300110\u65e5\u300113\u65e5\u300114\u65e5\u300115\u65e5\n10\u6642~14\u6642" }
  ];
  examples.forEach((example) => {
    const member = staffById(example.id);
    parseWishText(example.text).forEach((wish) => addWish(member, wish.day, wish.start, wish.end));
  });
  saveAll();
}

function renderLoginOptions() {
  const groups = {
    manager: sortedStaff().filter((member) => member.section === "manager"),
    kitchen: sortedStaff().filter((member) => member.section === "kitchen"),
    hall: sortedStaff().filter((member) => member.section === "hall")
  };
  $("#loginUser").innerHTML = `
    <optgroup label="${labels.manager}">
      ${groups.manager.map((member) => `<option value="${member.id}">${member.name}</option>`).join("")}
    </optgroup>
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
  $("#wishDay").innerHTML = periodDays().map((day) => `<option value="${day}">${day}\u65e5</option>`).join("");
  if (!periodDays().includes(selectedDay)) selectedDay = periodDays()[0];
  daySelect.value = selectedDay;
  $("#wishDay").value = selectedDay;
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
  const rows = [reportRows(topReportRows, days, "top-report-row")];
  let lastSection = "";

  sortedStaff().forEach((member) => {
    if (member.section !== lastSection) {
      if (member.section === "hall") rows.push(noodleRows(days));
      if (member.section === "hall") rows.push(shortageRows(days));
      rows.push(`<tr class="section-row"><td colspan="${days.length + 1}">${sectionName(member.section)}</td></tr>`);
      lastSection = member.section;
    }
    rows.push(`
      <tr>
        <td class="name-col">${member.name}</td>
        ${days.map((day) => renderShiftCell(day, member)).join("")}
      </tr>
    `);
  });
  rows.push(salesRows(days));
  rows.push(reportRows(bottomReportRows, days, "bottom-report-row"));

  shiftTable.innerHTML = `
    <thead>
      <tr><th class="name-col">\u66dc\u65e5</th>${days.map((day) => `<th class="${dayClass(day)} ${day === selectedDay ? "selected-day" : ""}">${weekday(day)}</th>`).join("")}</tr>
      <tr><th class="name-col">\u540d\u524d</th>${days.map((day) => `<th class="${dayClass(day)} ${day === selectedDay ? "selected-day" : ""}">${day}</th>`).join("")}</tr>
    </thead>
    <tbody>${rows.join("")}</tbody>
  `;

  const totalWishes = days.reduce((sum, day) => sum + (wishes[key(day)] || []).length, 0);
  const totalAssigned = days.reduce((sum, day) => sum + (assignments[key(day)] || []).length, 0);
  $("#boardSummary").textContent = `${labels.desired} ${totalWishes}${labels.people} / ${labels.decided} ${totalAssigned}${labels.people}`;
}

function reportRows(definitions, days, className) {
  return definitions.map((definition) => `
    <tr class="${className}">
      <td class="name-col">${definition.label}</td>
      ${days.map((day) => `<td class="${day === selectedDay ? "selected-day" : ""}">${reportCell(day, definition.id)}</td>`).join("")}
    </tr>
  `).join("");
}

function reportCell(day, field) {
  const value = reportNotes[key(day)]?.[field] || "";
  if (!isManager()) return value;
  return `<input class="table-text-input" data-action="report" data-day="${day}" data-field="${field}" maxlength="8" value="${value}" />`;
}

function sectionName(section) {
  if (section === "manager") return labels.manager;
  if (section === "kitchen") return labels.kitchen;
  return labels.hall;
}

function blankRows(count, colspan, label) {
  return Array.from({ length: count }, (_, index) => `
    <tr class="memo-row">
      <td class="name-col">${index === 0 ? label : ""}</td>
      ${Array.from({ length: colspan - 1 }, () => "<td></td>").join("")}
    </tr>
  `).join("");
}

function noodleRows(days) {
  return Array.from({ length: 3 }, (_, index) => `
    <tr class="memo-row noodle-row">
      <td class="name-col">${index === 0 ? "\u88fd\u9eba" : ""}</td>
      ${days.map((day) => `<td class="${day === selectedDay ? "selected-day" : ""}">${index === 0 ? noodleCell(day) : ""}</td>`).join("")}
    </tr>
  `).join("");
}

function noodleCell(day) {
  const selected = noodleAssignments[key(day)] || "";
  if (!isManager()) return selected ? staffById(selected)?.name || "" : "";
  return `
    <select class="table-select" data-action="noodle" data-day="${day}">
      <option value=""></option>
      ${workStaff().map((member) => `<option value="${member.id}" ${Number(selected) === member.id ? "selected" : ""}>${member.name}</option>`).join("")}
    </select>
  `;
}

function shortageRows(days) {
  return `
    <tr class="shortage-row">
      <td class="name-col">\u5348\u524d\u4e0d\u8db3</td>
      ${days.map((day) => `<td class="${day === selectedDay ? "selected-day" : ""}">${shortageText(day, "09:00", "15:00", Number(requiredMorning.value))}</td>`).join("")}
    </tr>
    <tr class="shortage-row">
      <td class="name-col">\u5348\u5f8c\u4e0d\u8db3</td>
      ${days.map((day) => `<td class="${day === selectedDay ? "selected-day" : ""}">${shortageText(day, "17:00", closeTime, Number(requiredEvening.value))}</td>`).join("")}
    </tr>
  `;
}

function shortageText(day, start, end, need) {
  const count = (assignments[key(day)] || []).filter((item) => overlaps(item, start, end)).length;
  const shortage = need - count;
  return shortage > 0 ? `-${shortage}` : "";
}

function salesRows(days) {
  return `
    <tr class="sales-row">
      <td class="name-col">\u58f2\u4e0a \u663c</td>
      ${days.map((day) => `<td class="${day === selectedDay ? "selected-day" : ""}">${salesCell(day, "lunch")}</td>`).join("")}
    </tr>
    <tr class="sales-row">
      <td class="name-col">\u58f2\u4e0a \u30c7\u30a3\u30ca\u30fc</td>
      ${days.map((day) => `<td class="${day === selectedDay ? "selected-day" : ""}">${salesCell(day, "dinner")}</td>`).join("")}
    </tr>
  `;
}

function salesCell(day, part) {
  const note = salesNotes[key(day)] || {};
  const amount = note[`${part}Amount`] || "";
  const count = note[`${part}Count`] || "";
  if (!isManager()) return amount || count ? `${amount}(${count})` : "";
  return `
    <span class="sales-inputs">
      <input data-action="sales" data-day="${day}" data-part="${part}" data-field="Amount" inputmode="numeric" maxlength="3" value="${amount}" />
      <span>(</span>
      <input data-action="sales" data-day="${day}" data-part="${part}" data-field="Count" inputmode="numeric" maxlength="3" value="${count}" />
      <span>)</span>
    </span>
  `;
}

function renderShiftCell(day, member) {
  const wish = getWish(day, member.id);
  const assigned = getAssignment(day, member.id);
  const clickable = wish ? `data-day="${day}" data-id="${member.id}"` : "";
  const selectedClass = day === selectedDay ? "selected-day" : "";
  if (assigned) return `<td class="cell assigned ${selectedClass}" ${clickable}>${assigned.start.replace(":00", "")}<br>${assigned.end.replace(":00", "")}</td>`;
  if (wish) return `<td class="cell rejected ${selectedClass}" ${clickable}>-</td>`;
  return `<td class="cell unavailable ${selectedClass}"></td>`;
}

function renderCandidates() {
  const list = wishes[key()] || [];
  const assigned = assignments[key()] || [];
  $("#dayTitle").textContent = `${selectedMonth}\u6708${selectedDay}\u65e5\u306e\u5e0c\u671b`;
  const morningShortage = shortageText(selectedDay, "09:00", "15:00", Number(requiredMorning.value)) || "OK";
  const eveningShortage = shortageText(selectedDay, "17:00", closeTime, Number(requiredEvening.value)) || "OK";
  $("#coverageBadge").textContent = `\u5348\u524d ${morningShortage} / \u5348\u5f8c ${eveningShortage}`;
  $("#coverageBadge").className = `badge ${morningShortage === "OK" && eveningShortage === "OK" ? "ok" : "danger"}`;

  candidateList.innerHTML = list.length
    ? list.map(renderCandidate).join("")
    : `<div class="meta">${labels.none}</div>`;
}

function renderCandidate(wish) {
  const member = staffById(wish.staffId);
  const picked = Boolean(getAssignment(selectedDay, member.id));
  const tag = risk(member, picked ? 0 : hoursBetween(wish.start, wish.end));
  const editable = canEditWish(member.id);
  return `
    <article class="candidate-card ${picked ? "selected" : ""}">
      <div class="row">
        <div>
          <div class="name">${member.name}</div>
          <div class="meta">${sectionName(member.section)} / ${wish.start} - ${wish.end}</div>
        </div>
        <span class="tag ${tag.className}">${tag.text}</span>
      </div>
      <div class="candidate-actions ${editable ? "" : "hidden-actions"}">
        <input type="time" value="${wish.start}" data-action="start" data-id="${member.id}" ${editable ? "" : "disabled"} />
        <input type="time" value="${wish.end}" data-action="end" data-id="${member.id}" ${editable ? "" : "disabled"} />
        ${isManager() ? `<button class="select-button ${picked ? "selected" : ""}" data-action="toggle" data-id="${member.id}">${picked ? labels.picked : labels.pick}</button>` : ""}
        ${editable ? `<button data-action="deleteWish" data-id="${member.id}">\u524a\u9664</button>` : ""}
      </div>
    </article>
  `;
}

function renderStaffList() {
  $("#staffCount").textContent = `${staff.length}${labels.people}`;
  $("#staffList").innerHTML = sortedStaff().map((member) => {
    const tag = risk(member);
    const sectionLabel = member.section === "manager" ? labels.manager : member.section === "kitchen" ? labels.kitchen : labels.hall;
    return `
      <article class="staff-card">
        <div class="row">
          <span class="name">${member.name}</span>
          <span class="tag ${tag.className}">${tag.text}</span>
        </div>
        <div class="meta">${sectionLabel} / ${member.type}</div>
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
  const required = Math.max(Number(requiredMorning.value), Number(requiredEvening.value));
  periodDays().forEach((day) => {
    assignments[key(day)] = [...(wishes[key(day)] || [])]
      .sort((a, b) => staffById(a.staffId).sort - staffById(b.staffId).sort)
      .slice(0, required)
      .map((wish) => ({ staffId: wish.staffId, start: wish.start, end: wish.end }));
  });
  saveAll();
  renderAll();
}

function updateWishTime(staffId, field, value) {
  if (!canEditWish(staffId)) return;
  const wish = getWish(selectedDay, staffId);
  if (wish) wish[field] = value;
  const assignment = getAssignment(selectedDay, staffId);
  if (assignment) assignment[field] = value;
  saveAll();
  renderAll();
}

function deleteWish(staffId) {
  if (!canEditWish(staffId)) return;
  wishes[key()] = (wishes[key()] || []).filter((wish) => wish.staffId !== Number(staffId));
  assignments[key()] = (assignments[key()] || []).filter((item) => item.staffId !== Number(staffId));
  saveAll();
  renderAll();
}

function clearMemberForm() {
  $("#memberId").value = "";
  $("#memberName").value = "";
  $("#memberSection").value = "hall";
  $("#memberSort").value = "99";
  $("#memberPin").value = "1111";
}

function editMember(id) {
  const member = staffById(id);
  $("#memberId").value = member.id;
  $("#memberName").value = member.name;
  $("#memberSection").value = member.section;
  $("#memberSort").value = member.sort;
  $("#memberPin").value = member.pin;
}

function deleteMember() {
  if (!isManager()) return;
  const id = Number($("#memberId").value);
  if (!id || id === currentUser.id) return;
  staff = staff.filter((member) => member.id !== id);
  Object.keys(wishes).forEach((dayKey) => {
    wishes[dayKey] = wishes[dayKey].filter((wish) => wish.staffId !== id);
  });
  Object.keys(assignments).forEach((dayKey) => {
    assignments[dayKey] = assignments[dayKey].filter((item) => item.staffId !== id);
  });
  clearMemberForm();
  saveAll();
  renderAll();
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

requiredMorning.addEventListener("change", renderAll);
requiredEvening.addEventListener("change", renderAll);
$("#autoPickButton").addEventListener("click", autoPick);
$("#printButton").addEventListener("click", () => window.print());
function toggleScreenshotMode() {
  document.body.classList.toggle("screenshot-mode");
  $("#zoomButton").textContent = document.body.classList.contains("screenshot-mode")
    ? "\u8868\u3092\u623b\u3059"
    : "\u8868\u3092\u62e1\u5927";
}

$("#zoomButton").addEventListener("click", toggleScreenshotMode);
$("#zoomExitButton").addEventListener("click", toggleScreenshotMode);

shiftTable.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-day][data-id]");
  if (!cell) return;
  selectedDay = Number(cell.dataset.day);
  daySelect.value = selectedDay;
  if (isManager()) toggleAssignment(selectedDay, Number(cell.dataset.id));
  else renderAll();
});

shiftTable.addEventListener("change", (event) => {
  const field = event.target.closest("[data-action]");
  if (!field || !isManager()) return;
  const day = Number(field.dataset.day);
  if (field.dataset.action === "noodle") {
    noodleAssignments[key(day)] = field.value;
  }
  if (field.dataset.action === "sales") {
    salesNotes[key(day)] ||= {};
    const prop = `${field.dataset.part}${field.dataset.field}`;
    salesNotes[key(day)][prop] = field.value.replace(/\D/g, "").slice(0, 3);
  }
  if (field.dataset.action === "report") {
    reportNotes[key(day)] ||= {};
    reportNotes[key(day)][field.dataset.field] = field.value.slice(0, 8);
  }
  saveAll();
  renderAll();
});

shiftTable.addEventListener("input", (event) => {
  const field = event.target.closest("input[data-action]");
  if (!field || !isManager()) return;
  if (field.dataset.action === "sales") {
    field.value = field.value.replace(/\D/g, "").slice(0, 3);
  }
  if (field.dataset.action === "report") {
    field.value = field.value.slice(0, 8);
  }
});

candidateList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "toggle") toggleAssignment(selectedDay, Number(button.dataset.id));
  if (button.dataset.action === "deleteWish") deleteWish(Number(button.dataset.id));
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

$("#addOneWishButton").addEventListener("click", () => {
  if (!currentUser) return;
  addWish(currentUser, Number($("#wishDay").value), $("#wishStart").value || openTime, $("#wishEnd").value || closeTime);
  saveAll();
  selectedDay = Number($("#wishDay").value);
  daySelect.value = selectedDay;
  renderAll();
});

$("#memberForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isManager()) return;
  const id = Number($("#memberId").value);
  const data = {
    name: $("#memberName").value.trim(),
    section: $("#memberSection").value,
    sort: Number($("#memberSort").value),
    pin: $("#memberPin").value.trim(),
    admin: $("#memberSection").value === "manager"
  };
  if (!/^\d{4}$/.test(data.pin) || !data.name) return;
  if (id) {
    const member = staffById(id);
    Object.assign(member, data);
  } else {
    staff.push({ id: Math.max(...staff.map((member) => member.id)) + 1, type: data.admin ? "\u7ba1\u7406\u8005" : "\u4e00\u822c", max: 120, base: 0, ...data });
  }
  currentUser = staffById(currentUser.id);
  clearMemberForm();
  saveAll();
  renderAll();
});

$("#clearMemberButton").addEventListener("click", clearMemberForm);
$("#deleteMemberButton").addEventListener("click", deleteMember);

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
