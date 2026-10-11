"""
Steel Surface Defect Image Analysis  (classical image processing, no ML)
Python + OpenCV + NumPy + Pandas + Matplotlib/Seaborn + SQLite

Usage:
    python steel_defect_analysis.py                      # built-in demo images with known masks
    python steel_defect_analysis.py --input_dir train_images   # real Severstal images
"""
import argparse, glob, os, sqlite3
import cv2
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

OUT = "out"
FIG = os.path.join(OUT, "figs")
MIN_AREA = 40          # pixels; smaller blobs are treated as noise
H, W = 256, 1600       # same size as Severstal images


# --------------------------------------------------------------------------
# 1. Demo data: synthetic steel strips with known defect masks
# --------------------------------------------------------------------------
def make_steel(seed, kinds):
    rng = np.random.default_rng(seed)
    base = rng.normal(140, 6, (H, W))
    streak = cv2.GaussianBlur(rng.normal(0, 14, (H, 1)).repeat(W, 1), (0, 0), 1.5)
    base += streak                                              # rolling streaks
    yy, xx = np.mgrid[0:H, 0:W]
    base += 18 * np.sin(xx / W * np.pi) + 8 * (yy / H - .5)     # uneven lighting
    base += cv2.GaussianBlur(rng.normal(0, 10, (H, W)), (0, 0), 1.2)
    img = base.copy()
    mask = np.zeros((H, W), np.uint8)

    def draw(fn):
        m = np.zeros((H, W), np.uint8); fn(m); return m > 0

    for kind in kinds:
        if kind == "scratch":
            for _ in range(rng.integers(2, 4)):
                x0, y0 = rng.integers(100, W - 500), rng.integers(20, H - 20)
                x1, y1 = x0 + rng.integers(150, 420), y0 + rng.integers(-25, 25)
                m = draw(lambda m: cv2.line(m, (x0, y0), (x1, y1), 255, int(rng.integers(2, 4))))
                img[m] -= rng.uniform(55, 80); mask[m] = 255
        elif kind == "patch":
            for _ in range(rng.integers(1, 3)):
                c = (int(rng.integers(150, W - 150)), int(rng.integers(50, H - 50)))
                ax = (int(rng.integers(35, 80)), int(rng.integers(14, 30)))
                m = draw(lambda m: cv2.ellipse(m, c, ax, float(rng.integers(0, 180)), 0, 360, 255, -1))
                soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 3)
                img -= soft * rng.uniform(45, 65); mask[m] = 255
        elif kind == "inclusion":
            for _ in range(rng.integers(8, 16)):
                c = (int(rng.integers(30, W - 30)), int(rng.integers(15, H - 15)))
                m = draw(lambda m: cv2.circle(m, c, int(rng.integers(3, 7)), 255, -1))
                img[m] -= rng.uniform(60, 90); mask[m] = 255
        elif kind == "pitting":
            cx, cy = int(rng.integers(300, W - 300)), int(rng.integers(60, H - 60))
            for _ in range(int(rng.integers(40, 70))):
                c = (int(rng.normal(cx, 70)), int(rng.normal(cy, 28)))
                m = draw(lambda m: cv2.circle(m, c, int(rng.integers(1, 4)), 255, -1))
                img[m] -= rng.uniform(55, 85); mask[m] = 255
    img = np.clip(img + rng.normal(0, 3, img.shape), 0, 255).astype(np.uint8)
    return img, mask


DEMO = [  # (name, defect kinds)
    ("steel_001", ["scratch"]),
    ("steel_002", ["patch"]),
    ("steel_003", ["inclusion"]),
    ("steel_004", ["pitting"]),
    ("steel_005", ["scratch", "patch", "inclusion"]),
    ("steel_006", []),                          # defect-free control
]


# --------------------------------------------------------------------------
# 2. Image-processing pipeline
# --------------------------------------------------------------------------
def analyse(gray):
    """Return dict of intermediate images and detected-region table."""
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    # background (illumination) estimate removed -> flat-field image
    bg = cv2.GaussianBlur(cv2.medianBlur(blur, 51), (0, 0), 25)
    flat = cv2.subtract(bg, blur)          # defects are darker than background -> positive
    flat = cv2.normalize(flat, None, 0, 255, cv2.NORM_MINMAX)
    # global threshold (Otsu) on the flat-field image
    otsu_t, _ = cv2.threshold(flat, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # stricter floor so a clean image with only noise yields nothing
    floor = np.mean(flat) + 4 * np.std(flat)
    t = max(otsu_t, floor)
    binary = (flat > t).astype(np.uint8) * 255
    k3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    k7 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    clean = cv2.morphologyEx(binary, cv2.MORPH_OPEN, k3)       # remove isolated noise
    clean = cv2.morphologyEx(clean, cv2.MORPH_CLOSE, k7)       # fill small gaps
    n, lab, stats, cent = cv2.connectedComponentsWithStats(clean, connectivity=8)
    keep = np.zeros_like(clean)
    rows = []
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        if a < MIN_AREA:
            continue
        keep[lab == i] = 255
        comp = (lab == i).astype(np.uint8)
        cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        per = cv2.arcLength(cnts[0], True)
        circ = 4 * np.pi * a / (per ** 2 + 1e-9)
        rows.append(dict(region_id=len(rows) + 1, x=x, y=y, width=w, height=h, area_px=int(a),
                         aspect_ratio=round(max(w, h) / max(1, min(w, h)), 2),
                         circularity=round(float(circ), 3),
                         cx=round(cent[i][0], 1), cy=round(cent[i][1], 1)))
    return dict(blur=blur, flat=flat, binary=binary, clean=clean, keep=keep, thr=t), pd.DataFrame(rows)


def classify(r):
    """Rule-based (not ML) shape labelling of a detected region."""
    if r.aspect_ratio >= 4:
        return "Scratch-like"
    if r.area_px >= 1500:
        return "Patch"
    if r.area_px < 250:
        return "Inclusion/Pit"
    return "Blob"


def overlay(gray, mask, df):
    rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    rgb[mask > 0] = (0.4 * rgb[mask > 0] + 0.6 * np.array([255, 0, 0])).astype(np.uint8)
    for r in df.itertuples():
        cv2.rectangle(rgb, (r.x - 3, r.y - 3), (r.x + r.width + 3, r.y + r.height + 3), (0, 255, 0), 1)
    return rgb


def iou(a, b):
    a, b = a > 0, b > 0
    u = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / u) if u else 1.0


# --------------------------------------------------------------------------
# 3. Main
# --------------------------------------------------------------------------
def main(input_dir=None):
    os.makedirs(FIG, exist_ok=True)
    items = []   # (name, gray, truth or None)
    if input_dir:
        files = sorted(glob.glob(os.path.join(input_dir, "*.jpg")) + glob.glob(os.path.join(input_dir, "*.png")))
        for f in files[:50]:
            g = cv2.imread(f, cv2.IMREAD_GRAYSCALE)
            if g is None:
                print("Skipping unreadable file:", f); continue
            items.append((os.path.basename(f), g, None))
    else:
        for name, kinds in DEMO:
            g, m = make_steel(int(name[-3:]) * 101 + 7, kinds)
            items.append((name, g, m))

    all_regions, summary, store = [], [], {}
    for name, gray, truth in items:
        res, df = analyse(gray)
        total = gray.shape[0] * gray.shape[1]
        defect_px = int((res["keep"] > 0).sum())
        if len(df):
            df["label"] = df.apply(classify, axis=1)
        df.insert(0, "image", name)
        all_regions.append(df)
        row = dict(image=name, width=gray.shape[1], height=gray.shape[0],
                   mean_intensity=round(float(gray.mean()), 2), std_intensity=round(float(gray.std()), 2),
                   threshold=round(float(res["thr"]), 1), n_regions=len(df), defect_area_px=defect_px,
                   defect_percent=round(100 * defect_px / total, 3),
                   largest_region_px=int(df.area_px.max()) if len(df) else 0,
                   mean_region_px=round(float(df.area_px.mean()), 1) if len(df) else 0.0)
        if truth is not None:
            row["IoU_vs_truth"] = round(iou(res["keep"], truth), 3)
            # baselines for comparison
            _, g_otsu = cv2.threshold(cv2.GaussianBlur(gray, (5, 5), 0), 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            g_adapt = cv2.adaptiveThreshold(cv2.GaussianBlur(gray, (5, 5), 0), 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                            cv2.THRESH_BINARY_INV, 51, 12)
            row["IoU_plain_Otsu"] = round(iou(g_otsu, truth), 3)
            row["IoU_adaptive"] = round(iou(g_adapt, truth), 3)
        summary.append(row)
        store[name] = (gray, res, df, truth)

    regions = pd.concat(all_regions, ignore_index=True) if all_regions else pd.DataFrame()
    summ = pd.DataFrame(summary)

    # ---- data storage: CSV + SQLite -------------------------------------
    summ.to_csv(os.path.join(OUT, "image_summary.csv"), index=False)
    regions.to_csv(os.path.join(OUT, "defect_regions.csv"), index=False)
    con = sqlite3.connect(os.path.join(OUT, "defects.db"))
    summ.to_sql("image_summary", con, if_exists="replace", index=False)
    regions.to_sql("defect_regions", con, if_exists="replace", index=False)
    q = pd.read_sql("SELECT image, defect_percent FROM image_summary ORDER BY defect_percent DESC LIMIT 3", con)
    con.close()
    print("\n=== IMAGE SUMMARY ===\n", summ.to_string(index=False))
    print("\n=== TOP-3 IMAGES BY DEFECT % (SQL) ===\n", q.to_string(index=False))
    if len(regions):
        print("\n=== REGION STATS (px) ===\n", regions.area_px.describe().round(1).to_string())
        print("\n=== REGIONS BY LABEL ===\n", regions.label.value_counts().to_string())
        print("\nCorr(area, aspect_ratio) = %.3f" % regions.area_px.corr(regions.aspect_ratio))
        qs = regions.area_px.quantile([.25, .75]); iqr = qs[.75] - qs[.25]
        print("Outlier regions (IQR rule): %d" % (regions.area_px > qs[.75] + 1.5 * iqr).sum())

    sns.set_theme(style="whitegrid")
    names = list(store)

    # ---- Fig A: processing pipeline for the most defective image ---------
    worst = summ.sort_values("defect_percent", ascending=False).image.iloc[0]
    gray, res, df, truth = store[worst]
    fig, ax = plt.subplots(5, 1, figsize=(11, 8.2))
    for a, im, t in zip(ax, [gray, res["flat"], res["binary"], res["clean"], overlay(gray, res["keep"], df)],
                        ["(a) Original / grayscale", "(b) Background-corrected (flat-field) image",
                         "(c) Thresholded image", "(d) After morphology (open + close)",
                         "(e) Detected defect regions"]):
        a.imshow(im, cmap="gray" if im.ndim == 2 else None, aspect="auto"); a.set_title(t, fontsize=9, loc="left"); a.axis("off")
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "fig_pipeline.png"), dpi=150); plt.close()

    # ---- Fig B: detections on all images ---------------------------------
    fig, ax = plt.subplots(len(names), 2, figsize=(12, 1.75 * len(names)))
    ax = np.atleast_2d(ax)
    for i, n in enumerate(names):
        g, r, d, tr = store[n]
        ax[i, 0].imshow(g, cmap="gray", aspect="auto"); ax[i, 0].set_title(n + " - original", fontsize=8, loc="left")
        ax[i, 1].imshow(overlay(g, r["keep"], d), aspect="auto"); ax[i, 1].set_title(n + " - detected (%d regions)" % len(d), fontsize=8, loc="left")
        ax[i, 0].axis("off"); ax[i, 1].axis("off")
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "fig_all_detections.png"), dpi=130); plt.close()

    # ---- Fig C: defect % per image ---------------------------------------
    plt.figure(figsize=(7, 3.6))
    ax = sns.barplot(data=summ, x="image", y="defect_percent", color="#2a6f97")
    ax.bar_label(ax.containers[0], fmt="%.2f", fontsize=8)
    plt.xticks(rotation=30, ha="right"); plt.ylabel("Defect area (% of image)"); plt.xlabel("")
    plt.title("Defect percentage per image"); plt.tight_layout()
    plt.savefig(os.path.join(FIG, "fig_defect_percent.png"), dpi=150); plt.close()

    if len(regions):
        # ---- Fig D: area histogram ---------------------------------------
        plt.figure(figsize=(7, 3.6))
        sns.histplot(regions.area_px, bins=25, color="#c1121f", log_scale=True)
        plt.xlabel("Region area (pixels, log scale)"); plt.ylabel("Number of regions")
        plt.title("Distribution of detected defect sizes"); plt.tight_layout()
        plt.savefig(os.path.join(FIG, "fig_area_hist.png"), dpi=150); plt.close()
        # ---- Fig E: scatter area vs aspect ratio -------------------------
        plt.figure(figsize=(7, 3.6))
        sns.scatterplot(data=regions, x="area_px", y="aspect_ratio", hue="label", s=45)
        plt.xscale("log"); plt.xlabel("Area (pixels, log)"); plt.ylabel("Aspect ratio (long/short side)")
        plt.title("Region size vs. elongation"); plt.tight_layout()
        plt.savefig(os.path.join(FIG, "fig_scatter.png"), dpi=150); plt.close()
        # ---- Fig F: boxplot of area per image ----------------------------
        plt.figure(figsize=(7, 3.6))
        sns.boxplot(data=regions, x="image", y="area_px", color="#9bc1d9"); plt.yscale("log")
        plt.xticks(rotation=30, ha="right"); plt.xlabel(""); plt.ylabel("Region area (px, log)")
        plt.title("Defect size spread per image"); plt.tight_layout()
        plt.savefig(os.path.join(FIG, "fig_box.png"), dpi=150); plt.close()
        # ---- Fig G: heatmap of defect locations --------------------------
        heat = np.zeros((H // 32, W // 100))
        for r in regions.itertuples():
            heat[min(int(r.cy // 32), heat.shape[0] - 1), min(int(r.cx // 100), heat.shape[1] - 1)] += r.area_px
        plt.figure(figsize=(8, 2.8))
        sns.heatmap(heat, cmap="rocket_r", cbar_kws={"label": "defect pixels"})
        plt.xlabel("Strip length (100-px bins)"); plt.ylabel("Strip width (32-px bins)")
        plt.title("Spatial distribution of defects (all images)"); plt.tight_layout()
        plt.savefig(os.path.join(FIG, "fig_heatmap.png"), dpi=150); plt.close()
        # ---- Fig H: label counts -----------------------------------------
        plt.figure(figsize=(5.2, 3.4))
        sns.countplot(data=regions, y="label", order=regions.label.value_counts().index, color="#588157")
        plt.title("Regions by shape class"); plt.xlabel("Count"); plt.ylabel(""); plt.tight_layout()
        plt.savefig(os.path.join(FIG, "fig_labels.png"), dpi=150); plt.close()

    if "IoU_vs_truth" in summ:
        m = summ[summ.defect_percent >= 0].melt(id_vars="image", value_vars=["IoU_vs_truth", "IoU_plain_Otsu", "IoU_adaptive"],
                                               var_name="method", value_name="IoU")
        m["method"] = m.method.map({"IoU_vs_truth": "Proposed (flat-field + Otsu)", "IoU_plain_Otsu": "Plain Otsu", "IoU_adaptive": "Adaptive"})
        plt.figure(figsize=(7.5, 3.6))
        sns.barplot(data=m[m.image != "steel_006"], x="image", y="IoU", hue="method")
        plt.ylim(0, 1); plt.xticks(rotation=30, ha="right"); plt.xlabel(""); plt.title("Segmentation accuracy (IoU vs ground truth)")
        plt.legend(fontsize=7); plt.tight_layout()
        plt.savefig(os.path.join(FIG, "fig_methods.png"), dpi=150); plt.close()

    # ---- Dashboard ---------------------------------------------------------
    fig = plt.figure(figsize=(14, 9))
    gs = fig.add_gridspec(3, 3, height_ratios=[1.05, 1, 1])
    a = fig.add_subplot(gs[0, :]); gray, res, df, _ = store[worst]
    a.imshow(overlay(gray, res["keep"], df), aspect="auto"); a.axis("off")
    a.set_title("Steel Surface Defect Dashboard  |  most defective image: %s" % worst, fontsize=12, loc="left", fontweight="bold")
    a = fig.add_subplot(gs[1, 0]); sns.barplot(data=summ, x="image", y="defect_percent", color="#2a6f97", ax=a)
    a.set_title("Defect % per image", fontsize=10); a.tick_params(axis="x", rotation=40, labelsize=7); a.set_xlabel("")
    if len(regions):
        a = fig.add_subplot(gs[1, 1]); sns.histplot(regions.area_px, bins=20, log_scale=True, color="#c1121f", ax=a)
        a.set_title("Defect size distribution", fontsize=10)
        a = fig.add_subplot(gs[1, 2]); sns.scatterplot(data=regions, x="area_px", y="aspect_ratio", hue="label", s=25, ax=a)
        a.set_xscale("log"); a.set_title("Area vs aspect ratio", fontsize=10); a.legend(fontsize=6)
        a = fig.add_subplot(gs[2, 0:2]); sns.heatmap(heat, cmap="rocket_r", ax=a, cbar=False)
        a.set_title("Spatial defect heatmap", fontsize=10)
        a = fig.add_subplot(gs[2, 2]); regions.label.value_counts().plot.pie(autopct="%1.0f%%", ax=a, textprops={"fontsize": 7})
        a.set_ylabel(""); a.set_title("Shape classes", fontsize=10)
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "fig_dashboard.png"), dpi=140); plt.close()

    # ---- text report ---------------------------------------------------------
    with open(os.path.join(OUT, "analysis_report.txt"), "w") as f:
        f.write("STEEL SURFACE DEFECT ANALYSIS REPORT\n" + "=" * 40 + "\n")
        for r in summ.itertuples():
            verdict = "REJECT / INSPECT" if r.defect_percent > 0.5 else ("MINOR DEFECTS" if r.n_regions else "PASS")
            f.write(f"{r.image}: regions={r.n_regions}, defect={r.defect_percent:.3f}% -> {verdict}\n")
    print("\nSaved CSVs, SQLite DB, figures and report in ./out")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input_dir", default=None, help="folder of Severstal images")
    main(ap.parse_args().input_dir)
