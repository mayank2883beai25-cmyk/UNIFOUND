(function () {
  const trackInput = document.getElementById("trackInput");
  const trackBtn = document.querySelector(".track-btn");
  const resultCard = document.getElementById("resultCard");

  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("id");
  if (paramId && trackInput) {
    trackInput.value = paramId.trim().toUpperCase();
    setTimeout(doTrack, 200);
  }

  if (trackBtn) {
    trackBtn.addEventListener("click", doTrack);
  }

  if (trackInput) {
    trackInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doTrack();
    });
  }

  function doTrack() {
    const raw = (trackInput?.value || "").trim().toUpperCase();
    if (!raw) {
      shake(trackInput);
      return;
    }

    if (!window.auth || !window.auth.isAuthenticated()) {
      showAuthRequired();
      return;
    }

    const user = window.auth.getCurrentUser();

    const all = JSON.parse(localStorage.getItem("unifound_reports") || "[]");
    const report = all.find((r) => r.id === raw);

    if (!report) {
      showResult(null, raw);
    } else {
      if (user.role !== "admin" && report.userId !== user.id) {
        showUnauthorized(raw);
        return;
      }
      showResult(report);
    }
  }

  function showAuthRequired() {
    if (!resultCard) return;
    resultCard.innerHTML = `
      <div class="not-found">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" style="margin-bottom: 12px;">
          <rect x="3" y="11" width="18" height="10" rx="2"/>
          <path d="M7 11V8a5 5 0 0 1 10 0v3"/>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">Login Required</h3>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">You must be logged in to track items.</p>
        <a href="login.html" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Login to Continue</a>
      </div>
    `;
    resultCard.classList.add("visible");
  }

  function showUnauthorized(rawId) {
    if (!resultCard) return;
    resultCard.innerHTML = `
      <div class="not-found">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" style="margin-bottom: 12px;">
          <rect x="3" y="11" width="18" height="10" rx="2"/>
          <path d="M7 11V8a5 5 0 0 1 10 0v3"/>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">Access Denied</h3>
        <p style="font-size: 14px; color: #6b7280;">You can only track your own reports.</p>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 8px;">Report ID: <code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;">${rawId}</code></p>
      </div>
    `;
    resultCard.classList.add("visible");
  }

  function showResult(report, rawId) {
    if (!resultCard) return;

    if (!report) {
      resultCard.innerHTML = `
        <div class="not-found">
          <div style="font-size:2rem;margin-bottom:0.4rem;">🔍</div>
          <strong>No report found</strong> for ID <code style="background:#f3f4f6;padding:2px 8px;border-radius:6px;">${rawId}</code>.
          <p style="margin-top:0.4rem;color:#9ca3af;font-size:0.82rem;">
            Double-check the ID or <a href="lost.html" style="color:#6366f1;">submit a new report</a>.
          </p>
        </div>
      `;
      resultCard.classList.add("visible");
      return;
    }

    const statusClass =
      {
        pending: "status-pending",
        under_review: "status-pending",
        match_found: "status-resolved",
        confirmed: "status-found",
        rejected: "status-pending",
        returned: "status-found",
      }[report.status] || "status-pending";

    const statusLabel =
      {
        pending: "Pending",
        under_review: "Under Review",
        match_found: "Match Found",
        confirmed: "Confirmed",
        rejected: "Rejected",
        returned: "Returned",
      }[report.status] || "Pending";

    const typeLabel = report.type === "lost" ? "Lost" : "Found";
    const typeEmoji = report.type === "lost" ? "🔴" : "🟢";

    const formattedDate = report.date
      ? new Date(report.date + "T00:00:00").toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

    const submittedAt = report.submittedAt
      ? new Date(report.submittedAt).toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

    const timelineSteps = buildTimeline(report);

    resultCard.innerHTML = `
      <div class="result-header">
        <div>
          <div class="result-id">${typeEmoji} ${typeLabel} Report · ${report.id}</div>
          <div class="result-name">${escHtml(report.itemName)}</div>
        </div>
        <span class="status-badge ${statusClass}">${statusLabel}</span>
      </div>

      <hr class="divider" />

      <div class="result-meta">
        <div>
          <label>Category</label>
          <span>${escHtml(report.category || "—")}</span>
        </div>
        <div>
          <label>${report.type === "lost" ? "Date Lost" : "Date Found"}</label>
          <span>${formattedDate}</span>
        </div>
        <div>
          <label>Location</label>
          <span>${escHtml(report.location || "—")}</span>
        </div>
        <div>
          <label>Submitted</label>
          <span>${submittedAt}</span>
        </div>
        ${
          report.description
            ? `
        <div style="grid-column:1/-1;">
          <label>Description</label>
          <span>${escHtml(report.description)}</span>
        </div>`
            : ""
        }
      </div>

      <hr class="divider" />

      <!-- Timeline -->
      <div style="margin-top:0.2rem;">
        <div style="font-size:0.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.9rem;font-weight:600;">
          Status Timeline
        </div>
        ${timelineSteps}
      </div>

      ${
        report.matchedWith
          ? `
      <hr class="divider" />
      <div style="background:#e0e7ff;border-radius:12px;padding:0.9rem 1rem;font-size:0.88rem;color:#3730a3;">
        ✓ <strong>Matched with report:</strong> ${report.matchedWith}
      </div>`
          : ""
      }

      ${
        report.status === "confirmed"
          ? `
      <hr class="divider" />
      <div style="background:#d1fae5;border-radius:12px;padding:0.9rem 1rem;font-size:0.88rem;color:#065f46;">
        <strong>Match Confirmed!</strong> Please contact the campus lost & found desk to arrange pickup.
      </div>`
          : ""
      }

      ${
        report.status === "returned"
          ? `
      <hr class="divider" />
      <div style="background:#e0e7ff;border-radius:12px;padding:0.9rem 1rem;font-size:0.88rem;color:#3730a3;">
        ✅ <strong>Returned!</strong> This item has been returned to the owner.
      </div>`
          : ""
      }

      ${
        report.status === "rejected"
          ? `
      <hr class="divider" />
      <div style="background:#fee2e2;border-radius:12px;padding:0.9rem 1rem;font-size:0.88rem;color:#991b1b;">
        ⚠️ <strong>Report Rejected</strong> Please contact support for more information.
      </div>`
          : ""
      }
    `;

    resultCard.classList.add("visible");
  }

  function buildTimeline(report) {
    const steps = [
      {
        key: "submitted",
        label: "Report Submitted",
        desc: "Your report was received and logged.",
        done: true,
        ts: report.submittedAt,
      },
      {
        key: "reviewing",
        label: "Under Review",
        desc: "Administrators are reviewing your report.",
        done: report.status !== "pending",
        ts: report.reviewedAt,
      },
      {
        key: "found",
        label: "Match Found",
        desc: "A potential match has been identified.",
        done:
          report.status === "match_found" ||
          report.status === "confirmed" ||
          report.status === "returned",
        ts: report.confirmedAt,
      },
      {
        key: "resolved",
        label: "Resolved",
        desc: "Item has been returned to the owner.",
        done: report.status === "returned",
        ts: report.returnedAt,
      },
    ];

    return steps
      .map(
        (step, i) => `
      <div style="display:flex;gap:0.9rem;margin-bottom:${i < steps.length - 1 ? "0" : "0"};">
        <div style="display:flex;flex-direction:column;align-items:center;width:20px;flex-shrink:0;">
          <div style="
            width:18px;height:18px;border-radius:50%;
            background:${step.done ? "#6366f1" : "#e5e7eb"};
            border:2.5px solid ${step.done ? "#6366f1" : "#e5e7eb"};
            display:flex;align-items:center;justify-content:center;
            flex-shrink:0;margin-top:1px;
          ">
            ${step.done ? `<svg width="9" height="9" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}
          </div>
          ${i < steps.length - 1 ? `<div style="width:2px;flex:1;background:${step.done ? "#c7d2fe" : "#f3f4f6"};margin:3px 0 0;min-height:28px;"></div>` : ""}
        </div>
        <div style="padding-bottom:${i < steps.length - 1 ? "1rem" : "0"};">
          <div style="font-size:0.88rem;font-weight:600;color:${step.done ? "#111" : "#9ca3af"};">${step.label}</div>
          <div style="font-size:0.78rem;color:#9ca3af;margin-top:1px;">${step.desc}</div>
          ${step.ts ? `<div style="font-size:0.72rem;color:#c4b5fd;margin-top:2px;">${new Date(step.ts).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>` : ""}
        </div>
      </div>
    `,
      )
      .join("");
  }

  function escHtml(str) {
    return String(str).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
  }

  function shake(el) {
    if (!el) return;
    el.style.animation = "ufShake 0.35s ease";
    el.addEventListener("animationend", () => (el.style.animation = ""), {
      once: true,
    });
    const s = document.createElement("style");
    s.textContent = `@keyframes ufShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}`;
    document.head.appendChild(s);
  }

  injectSuggestions();

  function injectSuggestions() {
    const card = document.querySelector(".search-card");
    if (!card) return;

    const all = JSON.parse(localStorage.getItem("unifound_reports") || "[]");
    if (all.length === 0) {
      const hint = document.createElement("div");
      hint.className = "search-suggestions";
      hint.innerHTML = `No reports yet. <a href="lost.html" style="color:#6366f1;font-weight:500;">Report a lost item</a> to get started.`;
      card.appendChild(hint);
      return;
    }
  }
})();
