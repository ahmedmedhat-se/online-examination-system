# Online Examination System 

> Developed by **Ahmed Medhat**

---
## Project Overview
**Online Examination System** is a full-stack web application designed to digitize the exam creation, execution, and evaluation process for educational institutions. It enables instructors to create timed exams with multiple-choice and short-answer questions, while students can take exams remotely and receive instant results.

**Developed by:** Ahmed Medhat
**Project Type:** Full‑Stack Web Application
**License:** Proprietary – All rights reserved

<div align="center">
  <img src="./public/online-examination-system-erd.png" alt="Online Examination System ERD" width="800" />
</div>

---
## Project Structure

### ONLINE-EXAMINATION-SYSTEM
```js
online-examination-system/
├── client/
├── database/
├── public/
├── server/
└── README.md
```

### Frontend (React.js + Vite)
```js
client/
├── node_modules/
├── public/
│   └── sutech-logo.jpg
├── src/
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

### Database (MySQL)
```js
database/
├── online-examination-system_erd.mwb
├── online-examination-system_erd.pdf
├── online-examination-system-erd.svg
└── schema.sql
```

### Backend (Express.js)
```js
server/
├── apis/
│   └── authRoutes.js
├── app/
│   ├── controllers/
│   │   └── authController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js
│   └── validations/
│       └── authValidation.js
├── config/
│   └── database.js
├── node_modules/
├── tests/
│   └── test-connection.test.js
├── utils/
│   ├── cookieHelper.js
│   └── jwt.js
├── .env
├── .gitignore
├── app.js
├── package-lock.json
└── package.json
```

---
## Technologies Used

### Frontend Technologies
| Technology                                                                                                                | Purpose                           | Version |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)                       | Frontend JavaScript Library       | 18.x    |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)            | CSS Framework for Styling         | 5.x     |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)                        | HTTP Client for API Calls         | 1.x     |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)   | Client-side Routing               | 6.x     |
| ![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white)   | Icon Library                      | 6.x     |

### Backend Technologies
| Technology                                                                                                                | Purpose                           | Version |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)                | JavaScript Runtime Environment    | 18.x+   |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)            | Web Application Framework         | 4.x     |
| ![Rate Limit](https://img.shields.io/badge/Express_Rate_Limit-FF0000?style=for-the-badge&logoColor=white)                 | API Rate Limiting Middleware      | 7.x     |
| ![Helmet](https://img.shields.io/badge/Helmet-000000?style=for-the-badge&logo=helmet&logoColor=white)                     | Security Headers Middleware       | 7.x     |
| ![CORS](https://img.shields.io/badge/CORS-000000?style=for-the-badge&logo=cors&logoColor=white)                           | Cross-Origin Resource Sharing     | 2.x     |
| ![Bcrypt](https://img.shields.io/badge/Bcrypt-000000?style=for-the-badge&logo=bcrypt&logoColor=white)                     | Password Hashing Library          | 5.x     |
| ![Cookie Parser](https://img.shields.io/badge/Cookie_Parser-FF6B6B?style=for-the-badge&logoColor=white)                   | Cookie Parsing Middleware         | 1.x     |
| ![Morgan](https://img.shields.io/badge/Morgan-000000?style=for-the-badge&logo=morgan&logoColor=white)                     | HTTP Request Logger               | 1.x     |
| ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)                  | Development Server Auto-Restart   | 3.x     |
| ![Dotenv](https://img.shields.io/badge/Dotenv-000000?style=for-the-badge&logo=dotenv&logoColor=white)                     | Environment Variables Loader      | 16.x    |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)                    | JSON Web Tokens Authentication    | 9.x     |
| ![MySQL2](https://img.shields.io/badge/MySQL2-005C84?style=for-the-badge&logo=mysql&logoColor=white)                      | MySQL Database Driver             | 3.x     |

### Database & Tools
| Technology                                                                                                                | Purpose                           | Version |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)                        | Relational Database               | 8.x     |
| ![MySQL Workbench](https://img.shields.io/badge/MySQL_Workbench-4479A1?style=for-the-badge&logo=mysql&logoColor=white)    | Database Design & Management      | 8.x     |

---

## Installation

### Frontend Dependencies
**Step 1. Setup React (JavaScript) + Vite Project:**
```bash
npm create vite@latest
```

**Step 2: Navigate and install dependencies:**
```bash
cd client
npm install
```

**Step 3: Install all dependencies:**
```bash
# React Router DOM
npm install react-router-dom

# Bootstrap 5
npm install bootstrap

# Font Awesome (all icon packages)
npm install @fortawesome/fontawesome-svg-core
npm install @fortawesome/free-solid-svg-icons
npm install @fortawesome/free-regular-svg-icons
npm install @fortawesome/free-brands-svg-icons
npm install @fortawesome/react-fontawesome
```

## Backend Dependencies
**Step 1. Setup Express.js Project:**
```bash
cd server
npm i -y
```

**Step 2: Install all dependencies:**
```bash
npm install express mysql2 dotenv cors helmet morgan cookie-parser bcrypt jsonwebtoken express-rate-limit

npm install -D nodemon
```

---
## Core Features
### Authentication & Authorization
* JWT‑based authentication
* Role‑based access control (User / Admin)
* Secure password hashing with **bcrypt**
* Protected routes and APIs
* Secure session handling

---
# API Documentation
## Base URL
```bash
http://localhost:PORT/api/auth
```

## Authentication
1. Register - POST base_url/register
2. Login - POST base_url/login
3. Get Current User - GET base_url/current-user
4. Update Profile - PUT base_url/profile
5. Change Password - PUT base_url/change-password
6. Logout - POST base_url/logout
7. Login Again - POST base_url/login
8. Deactivate Account - DELETE base_url/account

---
## License
**PROPRIETARY LICENSE**
© 2026 Ahmed Medhat. All Rights Reserved.
This project is a personal, non-commercial work created solely for the purpose of demonstrating full-stack web development skills.

*This software and associated documentation are proprietary and confidential. No part of this project may be reproduced, distributed, or transmitted in any form without prior written permission from the author.*

---
## Author
* **Ahmed Medhat** – Junior Full Stack JavaScript Developer