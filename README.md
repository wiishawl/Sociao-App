# Sociao

**A social media web application built with React and FastAPI.**

Sociao is a full-stack social media application inspired by modern social networking platforms. It allows users to explore posts, interact with content, connect with other users, view video posts, and manage their profiles.

The project focuses on building a complete social networking experience while implementing backend APIs, authentication, database operations, and interactive frontend components.

## Demo

Watch a walkthrough of Sociao showcasing its interface, features, and user interactions.

[![Sociao - Application Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

*Replace `YOUR_VIDEO_ID` with your YouTube video ID after uploading the demo.*

## Features

- **User Authentication:** User registration and login.
- **Home Feed:** Browse posts shared by users.
- **User Profiles:** View profile information, posts, followers, and following.
- **Stories:** Display user stories based on available posts.
- **Like Posts:** Like and unlike posts with persistent interaction counts.
- **Save Posts:** Save and unsave posts.
- **Share Posts:** Share posts and copy links to the clipboard.
- **Video Posts:** Video post previews with a dedicated full-screen video viewer.
- **Video Controls:** Play/pause and mute/unmute controls.
- **Comments:** Comment count display.
- **Follow System:** View followers and following lists, search users, and remove followers.
- **Messaging:** Inbox and individual chat interfaces.
- **Profile Management:** Edit profile information and upload profile pictures.
- **Create Posts:** Create posts through the application interface.

## Tech Stack

### Frontend
- React
- JavaScript
- Vite
- React Router
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Development Tools
- Visual Studio Code
- Git and GitHub
- Swagger UI for API documentation

## Project Structure

```text
sociao/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── auth_routes.py
│   ├── users_routes.py
│   ├── posts_routes.py
│   ├── comments_routes.py
│   ├── messages_routes.py
│   ├── upload_routes.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

*The structure is representative; individual filenames may vary.*

## Demo Accounts

The following sample accounts are available in the Sociao database for testing the application's features.

| Full Name | Username | Email | Password |
|---|---|---|---|
| Aarav Sharma | `aarav` | `aarav@example.com` | `Password123` |
| Meerava Iyer | `meera` | `meera@example.com` | `Password123` |
| Rohan Gupta | `rohan` | `rohan@example.com` | `Password123` |
| Sara Khan | `sara` | `sara@example.com` | `Password123` |
| Dev Patel | `dev` | `dev@example.com` | `Password123` |

**Note:** These are sample testing accounts intended for demonstration purposes. The shared password is deliberately simple to make testing easier. Do not use these credentials for real accounts or production environments.

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sociao.git
cd sociao
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Set Up the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

## Known Limitations

### Video Playback

The video viewer interface and its functionality have been implemented, including the full-screen viewing layout and playback controls.

However, video playback is currently not functioning correctly within the application, despite using a valid MP4 video URL that works independently.

The issue appears to be related to integrating video playback within the application rather than the validity of the video URL. This remains a known issue.

### Comments

The comment count is displayed, but full comment interaction is not yet implemented.

## Security and Privacy

- User passwords should never be stored in plain text.
- Passwords should be securely hashed by the backend.
- JWT secrets and environment variables must remain private.
- Never commit real user credentials, API keys, or access tokens.
- Local databases, virtual environments, and uploaded personal files should be excluded from Git where appropriate.

**Demo account warning:** The credentials listed above are for disposable testing accounts only. Remove or change them before using the application in a production environment.

## Future Improvements

- Complete video playback integration.
- Implement a fully functional commenting system.
- Expand messaging functionality.
- Improve profile customization.
- Further enhance responsive design and user experience.

## Author

**Vishaladitya Valluru**

Built as a full-stack development project to explore frontend development, backend API design, database integration, authentication, and interactive application development.

---

*Sociao — Connect, share, and interact.*
