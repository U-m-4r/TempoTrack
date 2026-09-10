# TempoTrack - Music & Album Streaming API Backend

A RESTful backend service built with Node.js, Express, MongoDB (Mongoose), and ImageKit for music file storage, featuring role-based authentication (User / Artist), music uploading, and album management.

---

## 🚀 Features

- **Authentication & Authorization**:
  - Secure user and artist registration and login with `bcryptjs` password hashing.
  - Role-based access control (`user` vs `artist`) using JSON Web Tokens (JWT) stored in HTTP cookies.
- **Music Management**:
  - Artists can upload music tracks (audio files) stored via ImageKit.
  - Users and artists can browse and fetch available music tracks.
- **Album Management**:
  - Artists can create albums and associate music track IDs with them.
  - Retrieve all albums or view specific albums with populated track and artist details.
- **Cloud Storage Integration**:
  - Integrated with ImageKit Node SDK for media management and storage.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- **File Uploads**: `multer` (in-memory storage) & `@imagekit/nodejs`
- **Environment Management**: `dotenv`

---

## 📁 Project Structure

```text
├── src/
│   ├── app.js                   # Express application configuration & routing
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication controller (register, login, logout)
│   │   └── music.controller.js  # Music and album controllers
│   ├── db/
│   │   └── db.js                # MongoDB database connection
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT authentication & role-based middleware
│   ├── models/
│   │   ├── album.model.js       # Album Mongoose schema
│   │   ├── music.model.js       # Music track Mongoose schema
│   │   └── user.model.js        # User Mongoose schema
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication endpoints
│   │   └── music.routes.js      # Music & album endpoints
│   └── services/
│       └── storage.service.js   # ImageKit upload service
├── .env.example                 # Sample environment variables
├── .gitignore                   # Files and folders to ignore in Git
├── package.json                 # Project dependencies and scripts
├── server.js                    # Server startup entry point
└── README.md                    # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- [ImageKit Account](https://imagekit.io/) (For private key and cloud media storage)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/U-m-4r/TempoTrack.git
cd TempoTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your actual credentials:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key_here
```

### 4. Run the Server

**Development Mode (with auto-reload via nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

---

## 📖 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user or artist (`role`: `'user'` \| `'artist'`) |
| `POST` | `/api/auth/login` | Public | Login with username/email & password (sets auth cookie) |
| `POST` | `/api/auth/logout` | Public | Clears authentication token cookie |

#### Register Request Body:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "artist" 
}
```
*(Default role is `user` if omitted)*

---

### 🎵 Music & Albums (`/api/music`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/music/upload` | Artist only | Upload music file (`multipart/form-data`) |
| `POST` | `/api/music/albums` | Artist only | Create a new album |
| `GET` | `/api/music` | Authenticated (User/Artist) | Get music tracks |
| `GET` | `/api/music/albums` | Authenticated (User/Artist) | List all albums |
| `GET` | `/api/music/albums/:albumId` | Authenticated (User/Artist) | Get album details by ID with populated tracks |

#### Upload Music Request (`multipart/form-data`):
- `title`: Track title (Text)
- `music`: Audio file (File)

#### Create Album Request Body (`application/json`):
```json
{
  "title": "Summer Vibes 2026",
  "musics": [
    "60d0fe4f5311236168a109ca",
    "60d0fe4f5311236168a109cb"
  ]
}
```

---

## 🛡️ Middleware Architecture

The application uses custom and third-party middleware to enforce authentication, role-based authorization, request parsing, and in-memory file handling:

### 1. Application-Level Middleware (`src/app.js`)
- **`express.json()`**: Parses incoming JSON request payloads into `req.body`.
- **`cookieParser()`**: Reads the HTTP `Cookie` header and extracts the JWT `token` into `req.cookies`.

### 2. Authentication & Role Authorization (`src/middleware/auth.middleware.js`)

| Middleware | Target Roles | Behavior & Access Logic |
| :--- | :--- | :--- |
| **`authUser`** | `user`, `artist` | Verifies the JWT token from `req.cookies.token`. If valid and role is `user` or `artist`, sets `req.user` with decoded token payload (`id`, `role`) and calls `next()`. Returns `401` if token is missing/invalid or `403` if role is unauthorized. |
| **`authArtist`** | `artist` | Enforces artist-only access for uploading music (`/api/music/upload`) and creating albums (`/api/music/albums`). Verifies the JWT and checks that `decoded.role === 'artist'`. Returns `403` with *"You don't have permission to perform this action"* if the user is not an artist. |

### 3. File Upload Middleware (`multer`)
- **`multer.memoryStorage()`**: Configured in `src/routes/music.routes.js` with `upload.single('music')`.
- Holds incoming audio files in memory (`req.file.buffer`) rather than saving temporary files to disk, passing the base64-encoded buffer directly to the ImageKit storage service (`src/services/storage.service.js`).

---

## 🔒 Security Best Practices

- Make sure **never** to commit your `.env` file to version control.
- Keep your `JWT_SECRET` and `IMAGEKIT_PRIVATE_KEY` strictly confidential.
- Use HTTPS in production to protect cookies in transit.

---

## 📄 License

This project is licensed under the [ISC](LICENSE) License.
