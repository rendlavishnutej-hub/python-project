/**
 * Steel Surface Defect Image Analysis
 * Course End Project (A9513 - Python Programming Lab)
 * Vardhaman College of Engineering
 */

// Dataset Definition from Project Outputs
const DATASET = {
  images: [
    {
      id: "steel_001",
      type: "Scratches",
      width: 1600,
      height: 256,
      mean_intensity: 149.87,
      std_intensity: 11.42,
      threshold: 87.0,
      n_regions: 2,
      defect_area_px: 1864,
      defect_percent: 0.455,
      largest_region_px: 1023,
      mean_region_px: 932.0,
      IoU_vs_truth: 0.972,
      IoU_plain_Otsu: 0.010,
      IoU_adaptive: 0.511,
      qc_default: "MINOR DEFECTS",
      strip_img: "out/figs/strips/strip_1.png"
    },
    {
      id: "steel_002",
      type: "Patch",
      width: 1600,
      height: 256,
      mean_intensity: 150.12,
      std_intensity: 12.79,
      threshold: 100.5,
      n_regions: 1,
      defect_area_px: 3965,
      defect_percent: 0.968,
      largest_region_px: 3965,
      mean_region_px: 3965.0,
      IoU_vs_truth: 0.825,
      IoU_plain_Otsu: 0.026,
      IoU_adaptive: 0.133,
      qc_default: "REJECT / INSPECT",
      strip_img: "out/figs/strips/strip_2.png"
    },
    {
      id: "steel_003",
      type: "Inclusions",
      width: 1600,
      height: 256,
      mean_intensity: 150.47,
      std_intensity: 11.31,
      threshold: 47.2,
      n_regions: 8,
      defect_area_px: 786,
      defect_percent: 0.192,
      largest_region_px: 147,
      mean_region_px: 98.2,
      IoU_vs_truth: 0.771,
      IoU_plain_Otsu: 0.004,
      IoU_adaptive: 0.306,
      qc_default: "MINOR DEFECTS",
      strip_img: "out/figs/strips/strip_3.png"
    },
    {
      id: "steel_004",
      type: "Pitting cluster",
      width: 1600,
      height: 256,
      mean_intensity: 150.26,
      std_intensity: 11.92,
      threshold: 57.1,
      n_regions: 11,
      defect_area_px: 690,
      defect_percent: 0.168,
      largest_region_px: 112,
      mean_region_px: 62.7,
      IoU_vs_truth: 0.366,
      IoU_plain_Otsu: 0.005,
      IoU_adaptive: 0.158,
      qc_default: "MINOR DEFECTS",
      strip_img: "out/figs/strips/strip_4.png"
    },
    {
      id: "steel_005",
      type: "Mixed (scratch + patch + inclusion)",
      width: 1600,
      height: 256,
      mean_intensity: 150.23,
      std_intensity: 13.68,
      threshold: 58.5,
      n_regions: 12,
      defect_area_px: 4926,
      defect_percent: 1.203,
      largest_region_px: 2234,
      mean_region_px: 410.5,
      IoU_vs_truth: 0.589,
      IoU_plain_Otsu: 0.058,
      IoU_adaptive: 0.449,
      qc_default: "REJECT / INSPECT",
      strip_img: "out/figs/strips/strip_5.png"
    },
    {
      id: "steel_006",
      type: "None (control)",
      width: 1600,
      height: 256,
      mean_intensity: 151.0,
      std_intensity: 11.0,
      threshold: 190.2,
      n_regions: 0,
      defect_area_px: 0,
      defect_percent: 0.000,
      largest_region_px: 0,
      mean_region_px: 0.0,
      IoU_vs_truth: 1.000,
      IoU_plain_Otsu: 0.000,
      IoU_adaptive: 0.000,
      qc_default: "PASS",
      strip_img: "out/figs/strips/strip_6.png"
    }
  ],

  regions: [
    // steel_001
    { image: "steel_001", region_id: 1, x: 415.0, y: 66.0, width: 202.0, height: 9.0, area_px: 1023, aspect_ratio: 22.44, circularity: 0.075, cx: 516.5, cy: 70.0, label: "Scratch-like" },
    { image: "steel_001", region_id: 2, x: 296.0, y: 202.0, width: 272.0, height: 22.0, area_px: 841, aspect_ratio: 12.36, circularity: 0.033, cx: 432.6, cy: 211.9, label: "Scratch-like" },

    // steel_002
    { image: "steel_002", region_id: 1, x: 309.0, y: 116.0, width: 77.0, height: 98.0, area_px: 3965, aspect_ratio: 1.27, circularity: 0.322, cx: 347.0, cy: 162.5, label: "Patch" },

    // steel_003
    { image: "steel_003", region_id: 1, x: 707.0, y: 20.0, width: 11.0, height: 11.0, area_px: 106, aspect_ratio: 1.0, circularity: 1.104, cx: 712.1, cy: 25.1, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 2, x: 116.0, y: 39.0, width: 11.0, height: 11.0, area_px: 93, aspect_ratio: 1.0, circularity: 1.075, cx: 121.0, cy: 44.1, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 3, x: 485.0, y: 42.0, width: 13.0, height: 13.0, area_px: 137, aspect_ratio: 1.0, circularity: 1.026, cx: 491.0, cy: 48.0, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 4, x: 1267.0, y: 139.0, width: 13.0, height: 13.0, area_px: 147, aspect_ratio: 1.0, circularity: 1.040, cx: 1273.0, cy: 144.8, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 5, x: 1315.0, y: 141.0, width: 9.0, height: 9.0, area_px: 65, aspect_ratio: 1.0, circularity: 1.143, cx: 1319.1, cy: 144.8, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 6, x: 1530.0, y: 166.0, width: 13.0, height: 13.0, area_px: 131, aspect_ratio: 1.0, circularity: 1.009, cx: 1535.9, cy: 171.8, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 7, x: 1492.0, y: 180.0, width: 9.0, height: 9.0, area_px: 63, aspect_ratio: 1.0, circularity: 1.158, cx: 1496.0, cy: 184.3, label: "Inclusion/Pit" },
    { image: "steel_003", region_id: 8, x: 473.0, y: 190.0, width: 8.0, height: 7.0, area_px: 44, aspect_ratio: 1.14, circularity: 1.153, cx: 476.2, cy: 192.9, label: "Inclusion/Pit" },

    // steel_004
    { image: "steel_004", region_id: 1, x: 1196.0, y: 51.0, width: 9.0, height: 12.0, area_px: 59, aspect_ratio: 1.33, circularity: 0.835, cx: 1200.0, cy: 55.9, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 2, x: 1108.0, y: 60.0, width: 7.0, height: 8.0, area_px: 43, aspect_ratio: 1.14, circularity: 1.189, cx: 1111.0, cy: 63.4, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 3, x: 1180.0, y: 60.0, width: 12.0, height: 8.0, area_px: 58, aspect_ratio: 1.5, circularity: 0.789, cx: 1186.6, cy: 63.8, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 4, x: 1120.0, y: 79.0, width: 19.0, height: 20.0, area_px: 112, aspect_ratio: 1.05, circularity: 0.375, cx: 1126.9, cy: 87.8, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 5, x: 1137.0, y: 87.0, width: 15.0, height: 14.0, area_px: 90, aspect_ratio: 1.07, circularity: 0.615, cx: 1143.9, cy: 93.9, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 6, x: 1188.0, y: 94.0, width: 7.0, height: 7.0, area_px: 40, aspect_ratio: 1.0, circularity: 1.198, cx: 1190.8, cy: 96.9, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 7, x: 1313.0, y: 95.0, width: 7.0, height: 7.0, area_px: 41, aspect_ratio: 1.0, circularity: 1.228, cx: 1316.2, cy: 98.0, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 8, x: 1282.0, y: 98.0, width: 7.0, height: 8.0, area_px: 43, aspect_ratio: 1.14, circularity: 1.189, cx: 1285.0, cy: 101.4, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 9, x: 1176.0, y: 101.0, width: 9.0, height: 8.0, area_px: 52, aspect_ratio: 1.12, circularity: 1.069, cx: 1179.9, cy: 104.2, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 10, x: 1211.0, y: 100.0, width: 18.0, height: 12.0, area_px: 111, aspect_ratio: 1.5, circularity: 0.522, cx: 1220.4, cy: 107.1, label: "Inclusion/Pit" },
    { image: "steel_004", region_id: 11, x: 1252.0, y: 100.0, width: 7.0, height: 7.0, area_px: 41, aspect_ratio: 1.0, circularity: 1.228, cx: 1255.0, cy: 103.2, label: "Inclusion/Pit" },

    // steel_005
    { image: "steel_005", region_id: 1, x: 616.0, y: 24.0, width: 21.0, height: 11.0, area_px: 90, aspect_ratio: 1.91, circularity: 0.358, cx: 625.3, cy: 29.5, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 2, x: 643.0, y: 28.0, width: 12.0, height: 8.0, area_px: 43, aspect_ratio: 1.5, circularity: 0.555, cx: 647.7, cy: 31.1, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 3, x: 249.0, y: 31.0, width: 10.0, height: 10.0, area_px: 77, aspect_ratio: 1.0, circularity: 1.025, cx: 253.0, cy: 35.8, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 4, x: 1190.0, y: 33.0, width: 11.0, height: 10.0, area_px: 82, aspect_ratio: 1.1, circularity: 0.997, cx: 1195.0, cy: 37.8, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 5, x: 933.0, y: 49.0, width: 158.0, height: 18.0, area_px: 456, aspect_ratio: 8.78, circularity: 0.053, cx: 1011.8, cy: 57.3, label: "Scratch-like" },
    { image: "steel_005", region_id: 6, x: 505.0, y: 70.0, width: 210.0, height: 30.0, area_px: 1492, aspect_ratio: 7.0, circularity: 0.076, cx: 616.4, cy: 86.2, label: "Scratch-like" },
    { image: "steel_005", region_id: 7, x: 886.0, y: 95.0, width: 13.0, height: 12.0, area_px: 123, aspect_ratio: 1.08, circularity: 1.049, cx: 892.1, cy: 100.3, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 8, x: 421.0, y: 108.0, width: 9.0, height: 9.0, area_px: 55, aspect_ratio: 1.0, circularity: 1.058, cx: 425.1, cy: 111.7, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 9, x: 242.0, y: 165.0, width: 432.0, height: 19.0, area_px: 2234, aspect_ratio: 22.74, circularity: 0.036, cx: 464.6, cy: 168.5, label: "Scratch-like" },
    { image: "steel_005", region_id: 10, x: 100.0, y: 178.0, width: 11.0, height: 12.0, area_px: 107, aspect_ratio: 1.09, circularity: 1.064, cx: 105.1, cy: 183.7, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 11, x: 871.0, y: 181.0, width: 10.0, height: 11.0, area_px: 88, aspect_ratio: 1.1, circularity: 1.07, cx: 875.8, cy: 185.9, label: "Inclusion/Pit" },
    { image: "steel_005", region_id: 12, x: 1183.0, y: 200.0, width: 10.0, height: 10.0, area_px: 79, aspect_ratio: 1.0, circularity: 1.012, cx: 1187.9, cy: 204.9, label: "Inclusion/Pit" }
  ],

  pos: [
    { no: "PO1", name: "Engineering Knowledge", desc: "Applied image-processing, statistical and programming knowledge to detect and measure steel defects." },
    { no: "PO2", name: "Problem Analysis", desc: "Analysed how uneven lighting, noise and defect shape affect defect detection and identified suitable operations." },
    { no: "PO3", name: "Design/Development of Solutions", desc: "Designed an eight-stage pipeline with flat-field correction, thresholding and region measurement for quality inspection." },
    { no: "PO4", name: "Conduct Investigations of Complex Problems", desc: "Investigated defect size, shape and location with statistics, ground-truth IoU checks and method comparison." },
    { no: "PO5", name: "Engineering Tool Usage", desc: "Used Python, OpenCV, NumPy, Pandas, Matplotlib, Seaborn and SQLite for processing, storage and visualization." },
    { no: "PO6", name: "The Engineer and The World", desc: "Supports automated quality inspection in steel manufacturing, reducing manual inspection and defective output." },
    { no: "PO7", name: "Ethics", desc: "Used the public dataset responsibly, reported accuracy honestly and kept the method transparent and reproducible." },
    { no: "PO8", name: "Individual and Collaborative Team work", desc: "Team members shared the work on coding, analysis, visualization and report writing." },
    { no: "PO9", name: "Communication", desc: "Communicated results through annotated images, charts, tables, a dashboard and this structured report." },
    { no: "PO10", name: "Project Management and Finance", desc: "Planned the work in stages and considered computing cost and feasibility using free, open-source tools." },
    { no: "PO11", name: "Life-Long Learning", desc: "Strengthened skills in image processing, data analysis and visualization for further study." }
  ],

  sdgs: [
    { no: "SDG 4", name: "Quality Education", desc: "Gives students hands-on experience in applying Python and image analysis to a real engineering problem." },
    { no: "SDG 8", name: "Decent Work and Economic Growth", desc: "Improves productivity and working conditions by automating repetitive visual inspection of steel." },
    { no: "SDG 9", name: "Industry, Innovation and Infrastructure", desc: "Promotes innovation in manufacturing through data-driven, automated quality inspection." },
    { no: "SDG 12", name: "Responsible Consumption and Production", desc: "Reduces material waste by detecting defects early and avoiding rejected or scrapped steel." }
  ]
};

// Global App State
let currentTab = "overview";
let activeStripId = "steel_001";
let currentSlide = 1;
const totalSlides = 8;

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initOverviewTable();
  initStripInspector();
  initFigureGallery();
  initQCSimulator();
  initAcademicMappings();
  initLightbox();

  // Print button
  document.getElementById("btn-print")?.addEventListener("click", () => {
    window.print();
  });
});

/* ==================== TABS CONTROLLER ==================== */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `tab-${tabId}`);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==================== OVERVIEW TABLE ==================== */
function initOverviewTable() {
  const tbody = document.querySelector("#table-overview-summary tbody");
  if (!tbody) return;

  tbody.innerHTML = DATASET.images.map(img => {
    let statusClass = "minor";
    if (img.qc_default.includes("REJECT")) statusClass = "reject";
    if (img.qc_default.includes("PASS")) statusClass = "pass";

    return `
      <tr>
        <td><strong>${img.id}</strong></td>
        <td>${img.type}</td>
        <td>${img.n_regions}</td>
        <td><strong>${img.defect_percent.toFixed(3)}%</strong> <span style="font-size:0.75rem; color:#64748b;">(${img.defect_area_px} px)</span></td>
        <td class="highlight-green">${img.IoU_vs_truth.toFixed(3)}</td>
        <td><span class="status-badge ${statusClass}">${img.qc_default}</span></td>
      </tr>
    `;
  }).join("");
}

/* ==================== STRIP INSPECTOR ==================== */
function initStripInspector() {
  const btnGroup = document.getElementById("strip-selector-btns");
  if (!btnGroup) return;

  btnGroup.innerHTML = DATASET.images.map(img => `
    <button class="strip-select-btn ${img.id === activeStripId ? 'active' : ''}" data-id="${img.id}">
      ${img.id} (${img.type})
    </button>
  `).join("");

  btnGroup.querySelectorAll(".strip-select-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeStripId = btn.dataset.id;
      btnGroup.querySelectorAll(".strip-select-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderActiveStrip();
    });
  });

  renderActiveStrip();
}

function renderActiveStrip() {
  const imgData = DATASET.images.find(im => im.id === activeStripId);
  if (!imgData) return;

  document.getElementById("active-strip-id").textContent = imgData.id;
  document.getElementById("active-strip-id-text").textContent = imgData.id;
  document.getElementById("active-strip-type").textContent = imgData.type;
  
  const qcBadge = document.getElementById("active-strip-qc");
  qcBadge.textContent = imgData.qc_default;
  qcBadge.className = "pill-val status-badge " + (imgData.qc_default.includes("REJECT") ? "reject" : imgData.qc_default.includes("PASS") ? "pass" : "minor");

  document.getElementById("active-strip-area").textContent = `${imgData.defect_area_px} px (${imgData.defect_percent.toFixed(3)}%)`;
  document.getElementById("active-strip-regions").textContent = imgData.n_regions;
  document.getElementById("active-strip-iou").textContent = imgData.IoU_vs_truth.toFixed(3);

  const stripImg = document.getElementById("active-strip-img");
  stripImg.src = imgData.strip_img;
  stripImg.alt = `Detected regions for ${imgData.id}`;

  // Filter regions
  const stripRegions = DATASET.regions.filter(r => r.image === activeStripId);
  document.getElementById("active-regions-count").textContent = `${stripRegions.length} Regions Logged`;

  const tbody = document.getElementById("strip-regions-body");
  if (stripRegions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #10b981;">✓ Zero Defect Regions Detected. Control Strip Verified PASS.</td></tr>`;
  } else {
    tbody.innerHTML = stripRegions.map(r => {
      let labelBadge = "badge-info";
      if (r.label === "Patch") labelBadge = "badge-red";
      if (r.label === "Scratch-like") labelBadge = "badge-amber";

      return `
        <tr>
          <td><strong>#${r.region_id}</strong></td>
          <td><code style="color:var(--cyan);">[${r.x}, ${r.y}, ${r.width}, ${r.height}]</code></td>
          <td><strong>${r.area_px}</strong> px</td>
          <td>${r.aspect_ratio}</td>
          <td>${r.circularity}</td>
          <td>(${r.cx}, ${r.cy})</td>
          <td><span class="badge ${labelBadge}">${r.label}</span></td>
        </tr>
      `;
    }).join("");
  }
}

/* ==================== FIGURE GALLERY & LIGHTBOX ==================== */
function initFigureGallery() {
  document.querySelectorAll(".gallery-card").forEach(card => {
    card.addEventListener("click", () => {
      const figName = card.dataset.fig;
      const title = card.dataset.title;
      const desc = card.dataset.desc;
      openLightbox(`out/figs/${figName}`, title, desc);
    });
  });

  // Overview dashboard image zoom
  const overDash = document.getElementById("overview-dash-img");
  if (overDash) {
    overDash.addEventListener("click", () => {
      openLightbox("out/figs/fig_dashboard.png", "Figure 9: Consolidated Defect Analysis Dashboard", "Full integrated view combining strip preview, defect percentage bar chart, size histogram, aspect ratio scatter, method IoU benchmark, and spatial defect accumulation density heatmap.");
    });
  }

  // Active strip preview zoom
  const activeImg = document.getElementById("active-strip-img");
  if (activeImg) {
    activeImg.addEventListener("click", () => {
      const curr = DATASET.images.find(im => im.id === activeStripId);
      openLightbox(curr.strip_img, `${curr.id} - Detection Strip Visual`, `Resolution: 1600 x 256 px. Original metal surface (left) alongside detected defect mask with green bounding boxes and red defect pixels (right). Ground-truth IoU = ${curr.IoU_vs_truth.toFixed(3)}.`);
    });
  }
}

function initLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const closeBtn = document.getElementById("btn-close-lightbox");

  closeBtn.addEventListener("click", closeLightbox);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeLightbox();
    }
  });
}

function openLightbox(src, title, desc) {
  const modal = document.getElementById("lightbox-modal");
  document.getElementById("lightbox-img").src = src;
  document.getElementById("lightbox-title").textContent = title;
  document.getElementById("lightbox-desc").textContent = desc;
  modal.classList.add("open");
}

function closeLightbox() {
  document.getElementById("lightbox-modal").classList.remove("open");
}

/* ==================== QC SIMULATOR ==================== */
function initQCSimulator() {
  const slider = document.getElementById("tolerance-slider");
  if (!slider) return;

  slider.addEventListener("input", () => {
    updateQCSimulator(parseFloat(slider.value));
  });

  updateQCSimulator(0.5);
}

function updateQCSimulator(threshold) {
  document.getElementById("slider-threshold-val").textContent = `${threshold.toFixed(2)}%`;
  document.getElementById("sim-active-thresh-label").textContent = `${threshold.toFixed(2)}%`;

  const tbody = document.getElementById("sim-results-body");
  let passCount = 0;
  let minorCount = 0;
  let rejectCount = 0;

  tbody.innerHTML = DATASET.images.map(img => {
    let simVerdict = "PASS";
    let simClass = "pass";

    if (img.defect_percent === 0) {
      simVerdict = "PASS";
      simClass = "pass";
      passCount++;
    } else if (img.defect_percent > threshold) {
      simVerdict = "REJECT / INSPECT";
      simClass = "reject";
      rejectCount++;
    } else {
      simVerdict = "MINOR DEFECTS";
      simClass = "minor";
      minorCount++;
    }

    return `
      <tr>
        <td><strong>${img.id}</strong></td>
        <td>${img.defect_percent.toFixed(3)}%</td>
        <td><span class="status-badge ${img.qc_default.includes('REJECT') ? 'reject' : img.qc_default.includes('PASS') ? 'pass' : 'minor'}">${img.qc_default}</span></td>
        <td><span class="status-badge ${simClass}">${simVerdict}</span></td>
      </tr>
    `;
  }).join("");

  document.getElementById("sim-stats-summary").innerHTML = `
    <div class="sim-stat-item">
      <span class="sim-stat-num" style="color:var(--emerald);">${passCount}</span>
      <span class="pill-label">Passed Strips</span>
    </div>
    <div class="sim-stat-item">
      <span class="sim-stat-num" style="color:var(--amber);">${minorCount}</span>
      <span class="pill-label">Minor Tolerance</span>
    </div>
    <div class="sim-stat-item">
      <span class="sim-stat-num" style="color:var(--red);">${rejectCount}</span>
      <span class="pill-label">Rejected Strips</span>
    </div>
  `;
}

/* ==================== ACADEMIC COMPLIANCE ==================== */
function initAcademicMappings() {
  const poBody = document.getElementById("table-po-body");
  if (poBody) {
    poBody.innerHTML = DATASET.pos.map(p => `
      <tr>
        <td><strong>${p.no}</strong></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.desc}</td>
      </tr>
    `).join("");
  }

  const sdgBody = document.getElementById("table-sdg-body");
  if (sdgBody) {
    sdgBody.innerHTML = DATASET.sdgs.map(s => `
      <tr>
        <td><strong style="color:var(--emerald);">${s.no}</strong></td>
        <td><strong>${s.name}</strong></td>
        <td>${s.desc}</td>
      </tr>
    `).join("");
  }
}


