# 04. UI/UX Design System & Style Guide
## Project Name: SetuHealth AI Copilot (सेतु हेल्थ)
**Design Tokens, Typography, Color Palette, & Component Guidelines**  
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  

---

## 1. Design Philosophy: "Empathetic Clinical Modernism"
Medical software is often drab, intimidating, or visually overwhelming with clinical clutter. **SetuHealth Copilot** redefines the personal health interface:
- **Calm, Reassuring Aesthetic**: Warm slate, clinical cyan/emerald greens, and clean white backgrounds reduce health-related anxiety.
- **Instant Scannability**: Distinct visual hierarchy separates urgent clinical flags from routine informational updates.
- **Glassmorphism & Depth**: Subtle backdrop-blur card containers with soft border highlights create an ultra-premium, modern feel.
- **High-Accessibility Typography**: High-contrast, clean sans-serif typefaces (Inter and Outfit) optimized for readability by all age cohorts.

---

## 2. Color Palette & Semantic Design Tokens

### Primary Brand Palette:
- **Medical Cyan / Emerald (`#0D9488` / `teal-600`)**: Symbolizes healing, precision, and modern biomedical science.
- **Trust Navy (`#0F172A` / `slate-900`)**: Deep grounding tone for authoritative headers, structural sidebars, and high-contrast typography.
- **Bio-Indigo (`#4F46E5` / `indigo-600`)**: Represents artificial intelligence, computation, and smart insights.

### Clinical Status Semantic Colors:
- **Normal / Healthy (`#10B981` / `emerald-500`)**:
  - Background: `bg-emerald-50`
  - Text: `text-emerald-700`
  - Border: `border-emerald-200`
- **Borderline / Elevated / Monitor (`#F59E0B` / `amber-500`)**:
  - Background: `bg-amber-50`
  - Text: `text-amber-700`
  - Border: `border-amber-200`
- **Critical / High Alert (`#EF4444` / `rose-500`)**:
  - Background: `bg-rose-50`
  - Text: `text-rose-700`
  - Border: `border-rose-200`
- **Informational / Administrative (`#3B82F6` / `blue-500`)**:
  - Background: `bg-blue-50`
  - Text: `text-blue-700`
  - Border: `border-blue-200`

---

## 3. Typography System
- **Heading Font**: `Outfit`, `Inter`, system sans-serif.
- **Body Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, Roboto, sans-serif.
- **Monospace Font** (for Lab test units, LOINC codes, and FHIR JSON): `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace.

### Scale:
- `text-3xl` / `text-4xl` (32px - 36px, font-bold): Hero Headlines & Main Dashboard titles.
- `text-xl` / `text-2xl` (20px - 24px, font-semibold): Section Headers & Metric cards.
- `text-base` / `text-lg` (16px - 18px, font-medium): Clinical summary paragraphs & narrative text.
- `text-sm` (14px, font-normal / font-medium): Table rows, metadata badges, medication dosage labels.
- `text-xs` (12px, font-medium): Reference ranges, timestamps, LOINC codes.

---

## 4. Component Design Patterns

### 4.1 Glassmorphic Health Card
```html
<div class="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
  <!-- Content -->
</div>
```

### 4.2 Biomarker Status Badge
```html
<!-- Normal Badge -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal
</span>

<!-- High / Flagged Badge -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Elevated (High)
</span>
```

### 4.3 Interactive Timeline Node
- Left vertical line in soft indigo/cyan gradient.
- Node icon colored by event type:
  - Cyan stethoscope icon for Doctor Prescription.
  - Emerald test tube icon for Laboratory Pathology.
  - Amber building icon for Hospital Discharge Summary.
  - Violet sparkler icon for AI Synthesized Health Review.

### 4.4 Medication Schedule Card
- Segregated into Morning (sunrise icon), Afternoon (sun icon), Evening (sunset icon), and Night (moon icon).
- Checkbox action for patient self-adherence tracking.
- Clear food timing indicator (`Before Meals` / `After Meals`).

---

## 5. Accessibility & Responsive Breakpoints
- **Mobile First Responsive**:
  - `sm`: 640px (Mobile portrait to landscape)
  - `md`: 768px (Tablet view, sidebar collapses into bottom or drawer nav)
  - `lg`: 1024px (Standard desktop, two-column split view)
  - `xl`: 1280px (Wide monitor, multi-column dashboard with side inspection)
- **Contrast Ratios**: All text elements adhere strictly to WCAG AA standards (minimum 4.5:1 contrast for normal text; 3:1 for large headers).
- **Reduced Motion**: Respects `prefers-reduced-motion` for animations.
