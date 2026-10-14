# QuoteWise AI — Frontend

> **Intelligent Supplier Evaluation & Procurement Decisions**  
> Modern, production-ready React client powered by Agentic AI for automated supplier quotation analysis, multi-criteria compliance scoring, and procurement decision support.

---

## 1. System Architecture & Tech Stack

Built strictly according to specifications:

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: JavaScript only (`.js` & `.jsx`) — strictly zero TypeScript files
- **Global State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (protected routes, layouts, redirect restoration)
- **API Client**: [Axios](https://axios-http.com/) configured with `withCredentials: true` (HTTP-only cookie auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with White + Premium Green Gradient design system
- **Form Management & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Visual Analytics**: [Recharts](https://recharts.org/) (supplier comparison bars, eligibility distribution donuts)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Motion & Transitions**: [Framer Motion](https://www.framer.com/motion/)

---

## 2. Design System & Brand Identity

- **Application Name**: **QuoteWise AI**
- **Aesthetic**: Premium Enterprise SaaS Procurement Platform with clean white surfaces, subtle borders (`#E2EAE4`), and elegant green gradients (`from-emerald-600 to-green-700`).
- **Color Palette**:
  - Primary Green: `#16A34A`
  - Deep Green: `#15803D`
  - Emerald: `#10B981`
  - Light Mint: `#ECFDF5`
  - Soft Background: `#F5FBF7`
  - Main Text: `#17211B`
  - Secondary Text: `#647067`
  - Border Lines: `#E2EAE4`

---

## 3. Backend Integration Summary

The frontend connects directly to the existing Express + SQLite + Gemini AI backend in `../Backend`:

| Feature | HTTP Method | Endpoint | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **User Registration** | `POST` | `/api/v1/auth/register` | `{ name, email, password, confirmPassword }` |
| **User Login** | `POST` | `/api/v1/auth/login` | `{ email, password }` (sets `accessToken` cookie) |
| **User Logout** | `POST` | `/api/v1/auth/logout` | None (clears `accessToken` cookie) |
| **Current User Session** | `GET` | `/api/v1/auth/me` | None (verified via cookie) |
| **Change Password** | `PATCH` | `/api/v1/auth/change-password`| `{ currentPassword, newPassword, confirmPassword }` |
| **List Requirements** | `GET` | `/api/v1/requirements` | None |
| **Create Requirement** | `POST` | `/api/v1/requirements` | `{ title, description, quantity, maxPrice, maxDeliveryDays, minWarrantyYears, paymentTerms, priceWeight, deliveryWeight, warrantyWeight }` *(weights sum to 100)* |
| **Requirement Details** | `GET` | `/api/v1/requirements/:id` | `id` parameter |
| **Update Requirement** | `PATCH`| `/api/v1/requirements/:id` | Partial requirement fields |
| **Delete Requirement** | `DELETE`| `/api/v1/requirements/:id`| `id` parameter |
| **Upload Quotation** | `POST` | `/api/v1/quotations/upload` | `FormData` with fields: `quotation` (PDF file), `requirementId`, `supplierName` |
| **Quotations by Req** | `GET` | `/api/v1/quotations/requirement/:id` | `requirementId` parameter |
| **Single Quotation** | `GET` | `/api/v1/quotations/:id` | `id` parameter |
| **Delete Quotation** | `DELETE`| `/api/v1/quotations/:id` | `id` parameter |
| **Execute AI Analysis** | `POST` | `/api/v1/analysis/requirement/:id/run` | `requirementId` parameter |
| **Get Requirement Analysis** | `GET` | `/api/v1/analysis/requirement/:id` | `requirementId` parameter |
| **Get Quotation Analysis** | `GET` | `/api/v1/analysis/quotation/:id` | `quotationId` parameter |

---

## 4. Environment Configuration

Create a `.env` file in the `Frontend` directory (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 5. Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Step 1: Start the Backend Server

In a terminal:
```bash
cd Backend
npm install
npm run dev
```
*The backend starts on `http://localhost:8000` with CORS configured for `http://localhost:5173`.*

### Step 2: Start the Frontend Application

In a separate terminal:
```bash
cd Frontend
npm install
npm run dev
```
*The frontend development server opens on `http://localhost:5173`.*

### Production Build Validation
```bash
cd Frontend
npm run build
```

---

## 6. End-to-End Workflow Testing Guide

Follow this test walkthrough to experience the entire procurement flow:

1. **User Registration**:
   - Navigate to `http://localhost:5173/` (auto-redirects to `/login`).
   - Click **Create an account** to navigate to `/register`.
   - Fill in your Full Name, Email, Password (min 6 characters), and Confirm Password.
   - Click **Create Account**.

2. **Login & Session Initialization**:
   - Sign in using your registered credentials.
   - The backend issues an HTTP-only `accessToken` cookie.
   - The application restores your session automatically and lands on `/dashboard`.

3. **Dashboard Overview**:
   - View real-time aggregated metrics: Total Requirements, Uploaded Quotations, Completed Evaluations, and Eligibility Breakdown.
   - Interact with Recharts visual charts and executive launchpads.

4. **Create Purchase Requirement**:
   - Click **New Requirement** in the top navigation or sidebar.
   - Enter Product Title (e.g. `Centrifugal Slurry Pump CP-500`).
   - Fill in Technical Specifications, Required Quantity, and Payment Terms.
   - Set mandatory constraints: Maximum Unit Price, Max Lead Time (Days), and Minimum Warranty (Years).
   - Configure evaluation weights (e.g., 50% Price, 30% Delivery, 20% Warranty). Notice the live sum validator ensuring exactly 100%.
   - Click **Save Purchase Requirement**.

5. **Upload Supplier Quotations**:
   - From the Requirement Details page, click **Upload Quotation** (or navigate to `/quotations/upload`).
   - Enter Supplier Name (e.g. `Apex Industrial Ltd`).
   - Drag & drop or select a PDF quotation document.
   - The system validates the format and uploads with real-time progress.
   - The backend parses the PDF and extracts product items, quantities, pricing, and warranty terms.

6. **Execute AI Supplier Analysis**:
   - On the Requirement Details page, click **Run AI Analysis**.
   - QuoteWise AI evaluates mandatory conditions first (excluding ineligible bids).
   - The scoring agent calculates multi-criteria weighted scores for eligible suppliers.
   - The ranking agent determines ranks, identifies risks, checks for unusually low prices, and outputs decision rationale.

7. **Inspect AI Decision Results**:
   - Review the **Recommended Winner** hero card with AI rationale.
   - Examine the **Supplier Evaluation & Ranking Table** with eligibility badges.
   - Inspect the **Multi-Criteria Score Comparison Bar Chart** (Total, Price, Delivery, Warranty).
   - Read supplier-specific explanations and risk warnings.

8. **Explore History & Reports**:
   - Revisit past evaluations in **Analysis History** (`/analysis/history`).
   - Review aggregated pipeline intelligence in **Reports & Analytics** (`/reports`).

9. **Account Settings & Logout**:
   - Open **Settings** (`/settings`) from the user dropdown or sidebar.
   - Test password change and display currency preferences.
   - Click **Sign Out** to clear session cookies and return safely to the login screen.
