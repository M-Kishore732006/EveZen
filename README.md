# EveZen - Premium Event Management Portal

EveZen is a modern, responsive, full-stack web application designed for universities and organizations to seamlessly manage events, ticketing, roles, and automated attendance tracking. Built with a premium SaaS-style interface, EveZen provides dedicated workflows for Administrators, Students, Faculty, and Supporting Staff.

# Deployment Link - https://eve-zen-delta.vercel.app
## 🚀 Key Features


### User Roles & Workflows
*   **Administrator**: Complete global oversight. Manage users, create and schedule events, assign venues, assign staff/faculty, and moderate all discussion forums. View analytical dashboards summarizing registration and attendance data.

*   **Student / Participant**: Browse a complete catalog of university events. Register for individual sessions or form teams. Access dynamic QR codes (with time-based expiration) for secure check-ins. Participate in dedicated event discussion forums.

*   **Faculty Coordinator**: Manage assigned events. Oversee registered students, send official announcements in forums, and monitor event execution.

*   **Supporting Staff**: Access role-based task checklists (e.g., Tech Support, Logistics, Electrician) automatically generated for assigned events. Use the built-in scanner portal to scan student QR codes and mark attendance.

### Technical Highlights
*   **Dynamic QR Authentication**: Time-based QR codes that refresh automatically and sync with backend OTP logic to prevent screenshot spoofing at entry checkpoints.

*   **Interactive Forums**: Dedicated discussion spaces scoped to specific events (Announcements, Questions, Resources).

*   **Fully Responsive**: Engineered completely with scalable flex-grids, auto-stacking cards, off-canvas navigation panels, and container bounds that adjust flawlessly from 4K desktops down to 320px mobile screens.

*   **SaaS Aesthetics**: Utilizes deep modern styling, glassmorphism hints, `framer-motion` micro-interactions, `lucide-react` iconography, and smooth state updates without full page reloads.

## 🛠️ Technology Stack

*   **Frontend**: React.js, React-Router-DOM, Bootstrap 5, Framer Motion, Axios.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ORM).
*   **Authentication**: JSON Web Tokens (JWT) & bcrypt.
*   **Calendar & Utilities**: FullCalendar (DayGrid view), React-Select.

## ⚙️ Local Development Setup

To run this project locally, ensure you have Node.js and MongoDB installed or a MongoDB Atlas URI.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd TechNova
   ```

2. **Configure Environment Variables:**
   * Create a `.env` file in the `server` directory:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```

3. **Install Dependencies & Start the Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Install Dependencies & Start the Frontend:**
   ```bash
   # Open a new terminal instance
   cd client
   npm install
   npm start
   ```

The frontend will boot on `http://localhost:3000` and communicate with the backend on `http://localhost:5000`.

---
*Built with ❤️ utilizing the MERN Stack architecture.*
