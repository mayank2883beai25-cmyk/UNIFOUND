// ==================== LOST ITEM REPORTING ====================

(function () {
  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("fileInput");
  const fileNameEl = document.getElementById("fileName");

  // File upload handling
  if (uploadBox && fileInput) {
    uploadBox.addEventListener("click", () => fileInput.click());

    uploadBox.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadBox.style.borderColor = "#6366f1";
    });
    uploadBox.addEventListener("dragleave", () => {
      uploadBox.style.borderColor = "";
    });
    uploadBox.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadBox.style.borderColor = "";
      if (e.dataTransfer.files[0]) {
        validateAndSetFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files[0]) {
        validateAndSetFile(fileInput.files[0]);
      }
    });
  }

  // Validate and set uploaded file
  function validateAndSetFile(file) {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Please upload a valid image file (JPG, PNG, or GIF)", "error");
      fileInput.value = "";
      return;
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("File size must be less than 5MB", "error");
      fileInput.value = "";
      return;
    }

    fileNameEl.textContent = "📎 " + file.name;
  }

  // Generate unique ID
  function generateID() {
    const year = new Date().getFullYear();
    const num = String(Math.floor(1000 + Math.random() * 9000));
    return `UF-${year}-${num}`;
  }

  function uniqueID() {
    let id;
    const all = JSON.parse(localStorage.getItem("unifound_reports") || "[]");
    const existing = new Set(all.map((r) => r.id));
    do {
      id = generateID();
    } while (existing.has(id));
    return id;
  }

  // Sanitize input
  function sanitizeInput(input) {
    if (!input) return "";
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate email
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate phone number
  function isValidPhone(phone) {
    if (!phone) return true; // Phone is optional
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, "").length >= 10;
  }

  // Form submission
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Check if user is authenticated
      if (!window.auth || !window.auth.isAuthenticated()) {
        showToast("Please login to submit a report", "error");
        window.location.href = "login.html";
        return;
      }

      const user = window.auth.getCurrentUser();

      const allInputs = [...form.querySelectorAll("input:not([type=file]), select, textarea")];
      const itemName  = sanitizeInput(allInputs[0]?.value?.trim() || "");
      const category  = sanitizeInput(allInputs[1]?.value || "");
      const desc      = sanitizeInput(allInputs[2]?.value || "");
      const location  = sanitizeInput(allInputs[3]?.value?.trim() || "");
      const dateLost  = allInputs[4]?.value || "";
      const email     = sanitizeInput(allInputs[5]?.value?.trim() || "");
      const phone     = sanitizeInput(allInputs[6]?.value?.trim() || "");

      // Validation
      if (!itemName) {
        showToast("Please enter an item name", "error");
        return;
      }

      if (!category) {
        showToast("Please select a category", "error");
        return;
      }

      if (!location) {
        showToast("Please enter the last seen location", "error");
        return;
      }

      if (!dateLost) {
        showToast("Please enter the date lost", "error");
        return;
      }

      // Validate date is not in the future
      const lostDate = new Date(dateLost);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (lostDate > today) {
        showToast("Date lost cannot be in the future", "error");
        return;
      }

      if (!email) {
        showToast("Please enter your email", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address", "error");
        return;
      }

      if (phone && !isValidPhone(phone)) {
        showToast("Please enter a valid phone number", "error");
        return;
      }

      // Check if file is uploaded
      if (fileInput && fileInput.files[0]) {
        validateAndSetFile(fileInput.files[0]);
        if (!fileNameEl.textContent) {
          showToast("Invalid file uploaded", "error");
          return;
        }
      }

      const id = uniqueID();
      const report = {
        id,
        type: "lost",
        itemName,
        category,
        description: desc,
        location,
        date: dateLost,
        email,
        phone,
        status: "pending",
        submittedAt: new Date().toISOString(),
        userId: user.id,
        userName: user.name
      };

      // Save to localStorage
      const all = JSON.parse(localStorage.getItem("unifound_reports") || "[]");
      all.push(report);
      localStorage.setItem("unifound_reports", JSON.stringify(all));

      // Show success modal
      showSuccessModal(id, report.status);
      form.reset();
      if (fileNameEl) fileNameEl.textContent = "";
    });
  }

  // Show success modal
  function showSuccessModal(id, status) {
    const existing = document.getElementById("uf-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "uf-modal";
    modal.className = "uf-modal-backdrop";
    modal.innerHTML = `
      <div class="uf-modal-card">
        <div class="uf-modal-icon">🎉</div>
        <h2 class="uf-modal-title">Report Submitted!</h2>
        <p class="uf-modal-subtitle">
          Your lost item has been registered. Use the ID below to track its status.
        </p>
        <div class="uf-modal-id-box">
          <div class="uf-modal-id-label">Your Tracking ID</div>
          <div class="uf-modal-id-value">${id}</div>
        </div>
        <div class="uf-modal-status">
          <span class="uf-modal-status-badge pending">Pending Review</span>
        </div>
        <p class="uf-modal-message">
          Your report is now pending review by campus administrators.
          You'll be notified when a match is found.
        </p>
        <div class="uf-modal-actions">
          <button class="uf-modal-btn uf-modal-btn-secondary" data-copy-id="${id}">Copy ID</button>
          <a href="track_item.html" class="uf-modal-btn uf-modal-btn-primary">Track Item →</a>
        </div>
        <button class="uf-modal-btn-close">Close</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Backdrop click to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Copy ID button
    const copyBtn = modal.querySelector("[data-copy-id]");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(id).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy ID";
          }, 2000);
        });
      });
    }

    // Close button
    const closeBtn = modal.querySelector(".uf-modal-btn-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => modal.remove());
    }
  }

  // Inject modal styles
  function injectModalStyles() {
    if (document.getElementById("uf-modal-styles")) return;
    const s = document.createElement("style");
    s.id = "uf-modal-styles";
    s.textContent = `
      .uf-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: ufFadeIn 0.2s ease;
      }

      .uf-modal-card {
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 420px;
        width: 90%;
        text-align: center;
        animation: ufSlideUp 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }

      .uf-modal-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .uf-modal-title {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 8px;
      }

      .uf-modal-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 24px;
        line-height: 1.6;
      }

      .uf-modal-id-box {
        background: #f3f4f6;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .uf-modal-id-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .uf-modal-id-value {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        letter-spacing: 1px;
      }

      .uf-modal-status {
        margin-bottom: 16px;
      }

      .uf-modal-status-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .uf-modal-status-badge.pending {
        background: #fef3c7;
        color: #b45309;
      }

      .uf-modal-status-badge.found {
        background: #d1fae5;
        color: #065f46;
      }

      .uf-modal-message {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 24px;
        line-height: 1.6;
      }

      .uf-modal-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }

      .uf-modal-btn {
        flex: 1;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .uf-modal-btn-primary {
        background: #6366f1;
        color: white;
        border: none;
      }

      .uf-modal-btn-primary:hover {
        background: #4f46e5;
      }

      .uf-modal-btn-secondary {
        background: #f3f4f6;
        color: #111827;
        border: none;
      }

      .uf-modal-btn-secondary:hover {
        background: #e5e7eb;
      }

      .uf-modal-btn-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 14px;
        cursor: pointer;
        padding: 8px;
      }

      .uf-modal-btn-close:hover {
        color: #111827;
      }

      @keyframes ufFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes ufSlideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }

  // Show toast notification
  function showToast(msg, type = "info") {
    const t = document.createElement("div");
    t.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${type === "error" ? "#ef4444" : "#111"}; color: #fff;
      padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.88rem;
      z-index: 99999; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      animation: ufFadeIn 0.2s ease;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    injectModalStyles();
    setTimeout(() => t.remove(), 3000);
  }
})();
