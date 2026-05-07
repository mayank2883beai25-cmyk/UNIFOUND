// ==================== ADMIN DASHBOARD ====================

const REPORTS_KEY = "unifound_reports";
const ACTIVITY_LOG_KEY = "unifound_activity_log";

// Status workflow
const STATUS_WORKFLOW = {
  pending: "Pending",
  under_review: "Under Review",
  match_found: "Match Found",
  confirmed: "Confirmed",
  rejected: "Rejected",
  returned: "Returned"
};

// Current tab and filters
let currentTab = "pending";
let currentFilters = {
  search: "",
  category: "",
  status: ""
};

let currentMatch = null;

// Load admin data
function loadAdminData() {
  updateAnalytics();
  loadReports();
  setupEventListeners();
}

// Update analytics cards
function updateAnalytics() {
  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const lostCount = reports.filter(r => r.type === "lost").length;
  const foundCount = reports.filter(r => r.type === "found").length;
  const matchedCount = reports.filter(r => r.status === "confirmed" || r.status === "returned").length;

  document.getElementById("pendingCount").textContent = pendingCount;
  document.getElementById("lostCount").textContent = lostCount;
  document.getElementById("foundCount").textContent = foundCount;
  document.getElementById("matchedCount").textContent = matchedCount;
}

// Load reports based on current tab and filters
function loadReports() {
  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  const container = document.getElementById("reportsContainer");
  const emptyState = document.getElementById("emptyState");

  // Filter reports
  let filteredReports = reports.filter(report => {
    // Tab filter
    if (currentTab === "pending") {
      return report.status === "pending";
    } else if (currentTab === "lost") {
      return report.type === "lost";
    } else if (currentTab === "found") {
      return report.type === "found";
    } else if (currentTab === "matched") {
      return report.status === "confirmed" || report.status === "returned";
    } else if (currentTab === "activity") {
      return false; // Activity tab shows log, not reports
    }

    return true;
  });

  // Search filter
  if (currentFilters.search) {
    const search = currentFilters.search.toLowerCase();
    filteredReports = filteredReports.filter(report =>
      report.itemName?.toLowerCase().includes(search) ||
      report.description?.toLowerCase().includes(search) ||
      report.location?.toLowerCase().includes(search) ||
      report.id?.toLowerCase().includes(search)
    );
  }

  // Category filter
  if (currentFilters.category) {
    filteredReports = filteredReports.filter(report =>
      report.category === currentFilters.category
    );
  }

  // Status filter
  if (currentFilters.status) {
    filteredReports = filteredReports.filter(report =>
      report.status === currentFilters.status
    );
  }

  // Sort by date (newest first)
  filteredReports.sort((a, b) =>
    new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  // Clear container
  container.innerHTML = "";

  // Show empty state or reports
  if (filteredReports.length === 0) {
    emptyState.style.display = "block";
    container.style.display = "none";
  } else {
    emptyState.style.display = "none";
    container.style.display = "grid";

    filteredReports.forEach(report => {
      const card = createReportCard(report);
      container.appendChild(card);
    });
  }

  // Load activity log if on activity tab
  if (currentTab === "activity") {
    loadActivityLog();
  }
}

// Create report card
function createReportCard(report) {
  const card = document.createElement("div");
  card.className = "report-card";

  const statusBadge = getStatusBadge(report.status);
  const typeIcon = report.type === "lost"
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

  const typeColor = report.type === "lost" ? "#ef4444" : "#10b981";

  card.innerHTML = `
    <div class="report-header">
      <div>
        <div class="report-id">${report.id || "N/A"}</div>
        <div class="report-title">${escapeHtml(report.itemName || "Unknown Item")}</div>
      </div>
      <span class="status-badge status-${report.status}">${STATUS_WORKFLOW[report.status] || report.status}</span>
    </div>

    <div class="report-meta">
      <div class="meta-item">
        <svg style="color: ${typeColor}">${typeIcon}</svg>
        <span>${report.type === "lost" ? "Lost" : "Found"}</span>
      </div>
      <div class="meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>${formatDate(report.date)}</span>
      </div>
      <div class="meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${escapeHtml(report.location || "Unknown")}</span>
      </div>
      <div class="meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>${escapeHtml(report.email || "No email")}</span>
      </div>
    </div>

    ${report.description ? `<div class="report-description">${escapeHtml(report.description)}</div>` : ""}

    <div class="report-footer">
      <div class="report-category">
        <span style="color: #6b7280; font-size: 13px;">Category:</span>
        <span style="font-weight: 500; margin-left: 4px;">${escapeHtml(report.category || "Other")}</span>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary" onclick="viewReportDetails('${report.id}')">View Details</button>
        ${report.status === "pending" ? `
          <button class="btn btn-primary" onclick="startReview('${report.id}')">Review</button>
        ` : ""}
        ${report.type === "lost" && report.status !== "confirmed" && report.status !== "returned" ? `
          <button class="btn btn-success" onclick="findMatches('${report.id}')">Find Matches</button>
        ` : ""}
        <button class="btn btn-danger" onclick="deleteReport('${report.id}')">Delete</button>
      </div>
    </div>
  `;

  return card;
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusMap = {
    pending: '<span class="status-badge status-pending">Pending</span>',
    under_review: '<span class="status-badge status-under_review">Under Review</span>',
    match_found: '<span class="status-badge status-match_found">Match Found</span>',
    confirmed: '<span class="status-badge status-confirmed">Confirmed</span>',
    rejected: '<span class="status-badge status-rejected">Rejected</span>',
    returned: '<span class="status-badge status-returned">Returned</span>'
  };
  return statusMap[status] || `<span class="status-badge">${status}</span>`;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      loadReports();
    });
  });

  // Search input
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentFilters.search = e.target.value;
    loadReports();
  });

  // Category filter
  document.getElementById("categoryFilter").addEventListener("change", (e) => {
    currentFilters.category = e.target.value;
    loadReports();
  });

  // Status filter
  document.getElementById("statusFilter").addEventListener("change", (e) => {
    currentFilters.status = e.target.value;
    loadReports();
  });
}

// Start review of a report
function startReview(reportId) {
  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  const report = reports.find(r => r.id === reportId);

  if (!report) {
    alert("Report not found");
    return;
  }

  // Update status to under_review
  report.status = "under_review";
  report.reviewedAt = new Date().toISOString();

  // Save updated reports
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  // Log activity
  logActivity("review", `Started review of ${report.type} item: ${report.itemName}`, reportId);

  // Refresh UI
  updateAnalytics();
  loadReports();

  // Show details
  viewReportDetails(reportId);
}

// Find potential matches for a lost item
function findMatches(lostReportId) {
  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  const lostReport = reports.find(r => r.id === lostReportId);

  if (!lostReport) {
    alert("Lost report not found");
    return;
  }

  // Find potential matches among found items
  const foundReports = reports.filter(r => r.type === "found" && r.status !== "rejected");

  // Calculate match scores
  const matches = foundReports.map(found => ({
    found,
    score: calculateMatchScore(lostReport, found)
  })).filter(m => m.score > 0);

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    alert("No potential matches found for this item.");
    return;
  }

  // Show the best match for review
  const bestMatch = matches[0];
  showMatchModal(lostReport, bestMatch.found, bestMatch.score);
}

// Calculate match score between lost and found items
function calculateMatchScore(lost, found) {
  let score = 0;
  const maxScore = 100;

  // Category match (20 points)
  if (lost.category === found.category) {
    score += 20;
  }

  // Item name similarity (30 points)
  const nameSimilarity = calculateSimilarity(
    lost.itemName?.toLowerCase() || "",
    found.itemName?.toLowerCase() || ""
  );
  score += nameSimilarity * 30;

  // Description similarity (20 points)
  const descSimilarity = calculateSimilarity(
    lost.description?.toLowerCase() || "",
    found.description?.toLowerCase() || ""
  );
  score += descSimilarity * 20;

  // Location similarity (15 points)
  const locationSimilarity = calculateSimilarity(
    lost.location?.toLowerCase() || "",
    found.location?.toLowerCase() || ""
  );
  score += locationSimilarity * 15;

  // Date proximity (15 points)
  if (lost.date && found.date) {
    const lostDate = new Date(lost.date);
    const foundDate = new Date(found.date);
    const daysDiff = Math.abs((lostDate - foundDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      score += 15;
    } else if (daysDiff <= 3) {
      score += 10;
    } else if (daysDiff <= 7) {
      score += 5;
    }
  }

  return Math.min(Math.round(score), maxScore);
}

// Calculate string similarity (Jaccard-like)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const words1 = str1.split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.split(/\s+/).filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// Show match modal
function showMatchModal(lostReport, foundReport, score) {
  currentMatch = { lost: lostReport, found: foundReport };

  const modal = document.getElementById("matchModal");
  const body = document.getElementById("matchModalBody");

  body.innerHTML = `
    <div class="match-score">
      Match Score: ${score}%
    </div>

    <div class="match-comparison">
      <div class="match-side lost">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Lost Item
        </h3>
        <div class="match-detail">
          <label>ID:</label>
          <span>${escapeHtml(lostReport.id)}</span>
        </div>
        <div class="match-detail">
          <label>Item:</label>
          <span>${escapeHtml(lostReport.itemName)}</span>
        </div>
        <div class="match-detail">
          <label>Category:</label>
          <span>${escapeHtml(lostReport.category || "Other")}</span>
        </div>
        <div class="match-detail">
          <label>Location:</label>
          <span>${escapeHtml(lostReport.location)}</span>
        </div>
        <div class="match-detail">
          <label>Date:</label>
          <span>${formatDate(lostReport.date)}</span>
        </div>
        <div class="match-detail">
          <label>Description:</label>
          <span>${escapeHtml(lostReport.description || "N/A")}</span>
        </div>
        <div class="match-detail">
          <label>Reported by:</label>
          <span>${escapeHtml(lostReport.email)}</span>
        </div>
      </div>

      <div class="match-side found">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Found Item
        </h3>
        <div class="match-detail">
          <label>ID:</label>
          <span>${escapeHtml(foundReport.id)}</span>
        </div>
        <div class="match-detail">
          <label>Item:</label>
          <span>${escapeHtml(foundReport.itemName)}</span>
        </div>
        <div class="match-detail">
          <label>Category:</label>
          <span>${escapeHtml(foundReport.category || "Other")}</span>
        </div>
        <div class="match-detail">
          <label>Location:</label>
          <span>${escapeHtml(foundReport.location)}</span>
        </div>
        <div class="match-detail">
          <label>Date:</label>
          <span>${formatDate(foundReport.date)}</span>
        </div>
        <div class="match-detail">
          <label>Description:</label>
          <span>${escapeHtml(foundReport.description || "N/A")}</span>
        </div>
        <div class="match-detail">
          <label>Reported by:</label>
          <span>${escapeHtml(foundReport.email)}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

// Close match modal
function closeMatchModal() {
  document.getElementById("matchModal").classList.remove("active");
  currentMatch = null;
}

// Confirm match
function confirmMatch() {
  if (!currentMatch) {
    alert("No match selected");
    return;
  }

  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");

  // Update lost report status
  const lostIndex = reports.findIndex(r => r.id === currentMatch.lost.id);
  if (lostIndex !== -1) {
    reports[lostIndex].status = "confirmed";
    reports[lostIndex].matchedWith = currentMatch.found.id;
    reports[lostIndex].confirmedAt = new Date().toISOString();
  }

  // Update found report status
  const foundIndex = reports.findIndex(r => r.id === currentMatch.found.id);
  if (foundIndex !== -1) {
    reports[foundIndex].status = "confirmed";
    reports[foundIndex].matchedWith = currentMatch.lost.id;
    reports[foundIndex].confirmedAt = new Date().toISOString();
  }

  // Save updated reports
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  // Log activity
  logActivity("confirm", `Confirmed match between lost item ${currentMatch.lost.id} and found item ${currentMatch.found.id}`, currentMatch.lost.id);

  // Close modal and refresh
  closeMatchModal();
  updateAnalytics();
  loadReports();

  alert("Match confirmed! Both reports have been updated.");
}

// Reject match
function rejectMatch() {
  if (!currentMatch) {
    alert("No match selected");
    return;
  }

  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");

  // Update lost report status back to pending
  const lostIndex = reports.findIndex(r => r.id === currentMatch.lost.id);
  if (lostIndex !== -1) {
    reports[lostIndex].status = "pending";
  }

  // Save updated reports
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  // Log activity
  logActivity("reject", `Rejected match between lost item ${currentMatch.lost.id} and found item ${currentMatch.found.id}`, currentMatch.lost.id);

  // Close modal and refresh
  closeMatchModal();
  updateAnalytics();
  loadReports();

  alert("Match rejected. The lost report is back in pending status.");
}

// View report details
function viewReportDetails(reportId) {
  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  const report = reports.find(r => r.id === reportId);

  if (!report) {
    alert("Report not found");
    return;
  }

  const modal = document.getElementById("reportModal");
  const body = document.getElementById("reportModalBody");

  const typeIcon = report.type === "lost"
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

  body.innerHTML = `
    <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center;">
      ${typeIcon}
      <div>
        <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">${report.id}</div>
        <div style="font-size: 20px; font-weight: 600; color: #111827;">${escapeHtml(report.itemName)}</div>
      </div>
      <span class="status-badge status-${report.status}">${STATUS_WORKFLOW[report.status] || report.status}</span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Type</label>
        <div style="font-size: 14px; color: #111827; font-weight: 500;">${report.type === "lost" ? "Lost Item" : "Found Item"}</div>
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Category</label>
        <div style="font-size: 14px; color: #111827; font-weight: 500;">${escapeHtml(report.category || "Other")}</div>
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Date</label>
        <div style="font-size: 14px; color: #111827; font-weight: 500;">${formatDate(report.date)}</div>
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Location</label>
        <div style="font-size: 14px; color: #111827; font-weight: 500;">${escapeHtml(report.location || "Unknown")}</div>
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Email</label>
        <div style="font-size: 14px; color: #111827; font-weight: 500;">${escapeHtml(report.email || "N/A")}</div>
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Phone</label>
        <div style="font-size: 14px; color: #111827; font-weight: 500;">${escapeHtml(report.phone || "N/A")}</div>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Description</label>
      <div style="padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px; color: #374151; line-height: 1.6;">
        ${escapeHtml(report.description || "No description provided")}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Submitted At</label>
        <div style="font-size: 14px; color: #111827;">${new Date(report.submittedAt).toLocaleString()}</div>
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 500;">Status History</label>
        <div style="font-size: 14px; color: #111827;">
          ${report.reviewedAt ? `Reviewed: ${new Date(report.reviewedAt).toLocaleString()}<br>` : ""}
          ${report.confirmedAt ? `Confirmed: ${new Date(report.confirmedAt).toLocaleString()}` : ""}
        </div>
      </div>
    </div>

    ${report.matchedWith ? `
      <div style="padding: 16px; background: #e0e7ff; border-radius: 8px; margin-bottom: 24px;">
        <div style="font-size: 14px; font-weight: 600; color: #3730a3; margin-bottom: 4px;">Matched With</div>
        <div style="font-size: 14px; color: #3730a3;">Report ID: ${report.matchedWith}</div>
      </div>
    ` : ""}

    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      ${report.status === "pending" || report.status === "under_review" ? `
        <button class="btn btn-primary" onclick="startReview('${report.id}'); closeReportModal();">Start Review</button>
      ` : ""}
      ${report.type === "lost" && report.status !== "confirmed" && report.status !== "returned" ? `
        <button class="btn btn-success" onclick="findMatches('${report.id}'); closeReportModal();">Find Matches</button>
      ` : ""}
      ${report.status === "confirmed" ? `
        <button class="btn btn-success" onclick="markAsReturned('${report.id}'); closeReportModal();">Mark as Returned</button>
      ` : ""}
      <button class="btn btn-danger" onclick="deleteReport('${report.id}'); closeReportModal();">Delete Report</button>
    </div>
  `;

  modal.classList.add("active");
}

// Close report modal
function closeReportModal() {
  document.getElementById("reportModal").classList.remove("active");
}

// Mark report as returned
function markAsReturned(reportId) {
  if (!confirm("Are you sure you want to mark this item as returned?")) {
    return;
  }

  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  const report = reports.find(r => r.id === reportId);

  if (!report) {
    alert("Report not found");
    return;
  }

  // Update status
  report.status = "returned";
  report.returnedAt = new Date().toISOString();

  // If matched, also update the matched report
  if (report.matchedWith) {
    const matchedReport = reports.find(r => r.id === report.matchedWith);
    if (matchedReport) {
      matchedReport.status = "returned";
      matchedReport.returnedAt = new Date().toISOString();
    }
  }

  // Save updated reports
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  // Log activity
  logActivity("confirm", `Marked item ${reportId} as returned`, reportId);

  // Refresh UI
  updateAnalytics();
  loadReports();

  alert("Item marked as returned!");
}

// Delete report
function deleteReport(reportId) {
  if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
    return;
  }

  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  const report = reports.find(r => r.id === reportId);

  if (!report) {
    alert("Report not found");
    return;
  }

  // Remove report
  const updatedReports = reports.filter(r => r.id !== reportId);

  // If matched, also update the matched report
  if (report.matchedWith) {
    const matchedReport = updatedReports.find(r => r.id === report.matchedWith);
    if (matchedReport) {
      matchedReport.status = "pending";
      delete matchedReport.matchedWith;
    }
  }

  // Save updated reports
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));

  // Log activity
  logActivity("delete", `Deleted report ${reportId}: ${report.itemName}`, reportId);

  // Refresh UI
  updateAnalytics();
  loadReports();

  alert("Report deleted successfully!");
}

// Log activity
function logActivity(type, message, reportId) {
  const activities = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || "[]");

  activities.unshift({
    id: `activity-${Date.now()}`,
    type,
    message,
    reportId,
    timestamp: new Date().toISOString()
  });

  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.pop();
  }

  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(activities));
}

// Load activity log
function loadActivityLog() {
  const activities = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || "[]");
  const container = document.getElementById("reportsContainer");
  const emptyState = document.getElementById("emptyState");

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";

  if (activities.length === 0) {
    emptyState.style.display = "block";
    container.style.display = "none";
    return;
  }

  emptyState.style.display = "none";

  activities.forEach(activity => {
    const item = document.createElement("div");
    item.className = "activity-item";

    const iconMap = {
      confirm: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      reject: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      review: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      delete: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    };

    item.innerHTML = `
      <div class="activity-icon ${activity.type}">
        ${iconMap[activity.type] || iconMap.review}
      </div>
      <div class="activity-content">
        <h4>${escapeHtml(activity.message)}</h4>
        <p>Report ID: ${activity.reportId || "N/A"}</p>
        <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
      </div>
    `;

    container.appendChild(item);
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
  // Check if admin is logged in
  if (window.auth && !window.auth.isAdmin()) {
    alert("Access denied. Admin privileges required.");
    window.location.href = "login.html";
    return;
  }

  loadAdminData();
});
