# Unifound - Campus Lost & Found Platform

<div align="center">

![Unifound Logo](images/Untitled%20design.png)

A modern, secure, and user-friendly lost & found platform designed for university campuses.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://www.javascript.com/)
[![HTML5](https://img.shields.io/badge/HTML5-5-orange)](https://www.w3.org/TR/html5/)
[![CSS3](https://img.shields.io/badge/CSS3-3-blue)](https://www.w3.org/Style/CSS/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

---

## 📖 About

Unifound is a comprehensive lost and found management system that helps students and staff report, track, and recover lost items on campus. The platform features smart item matching, admin verification workflows, and real-time status tracking.

### Key Highlights

- 🔐 **Secure Authentication** - User login/signup with role-based access control
- 🎯 **Smart Matching** - Intelligent algorithm to match lost and found items
- 📊 **Admin Dashboard** - Comprehensive admin panel for verification and management
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-Time Tracking** - Live status updates and timeline visualization
- 🛡️ **Data Privacy** - LocalStorage-based data persistence with session management

---

## ✨ Features

### For Users

| Feature | Description |
|---------|-------------|
| **Account Management** | Sign up and login with secure authentication |
| **Report Lost Items** | Submit detailed reports with photos and descriptions |
| **Report Found Items** | Help others by reporting items you've found |
| **Track Status** | Monitor your report's progress in real-time |
| **Personal Dashboard** | View all your reports and statistics |
| **Smart Notifications** | Get alerts when matches are found |

### For Administrators

| Feature | Description |
|---------|-------------|
| **Admin Dashboard** | Overview of all reports with analytics |
| **Verification Queue** | Review and verify pending reports |
| **Match Management** | Confirm or reject potential matches |
| **Activity Log** | Track all admin actions and system events |
| **Advanced Search** | Filter by category, status, and keywords |
| **Bulk Actions** | Manage multiple reports efficiently |

---

## 🎨 Screenshots

### Landing Page
![Landing Page](images/Untitled%20design.png)

### User Dashboard
- Personal statistics overview
- Quick action buttons
- Filterable reports list

### Admin Panel
- Analytics cards with real-time stats
- Tabbed interface for different report types
- Match comparison view with similarity scores

---

## 🚀 Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage support

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/unifound.git
cd unifound
```

2. **Open the project**

Simply open `index.html` in your web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. **Access the application**

Navigate to `http://localhost:8000` in your browser.

---

## 📖 Usage

### Default Admin Credentials

```
Email: admin@unifound.app
Password: admin123
```

### User Guide

#### 1. Create an Account
- Go to the login page
- Click "Sign Up" tab
- Enter your details and create an account

#### 2. Report a Lost Item
- Click "Report Lost Item"
- Fill in the required fields (item name, category, location, date)
- Optionally add description and photo
- Submit and save your tracking ID

#### 3. Report a Found Item
- Click "Found Something"
- Provide item details and found location
- Submit to help others recover their belongings

#### 4. Track Your Report
- Go to "Track Status"
- Enter your tracking ID
- View the current status and timeline

#### 5. Admin Operations
- Login with admin credentials
- Review pending reports
- Find and confirm matches
- Manage activity logs

### Status Workflow

```
Pending → Under Review → Match Found → Confirmed → Returned
```

---

## 🏗️ Project Structure

```
unifound/
├── css/
│   ├── admin.css          # Admin panel styles
│   ├── contact.css        # Contact page styles
│   ├── dashboard.css      # User dashboard styles
│   ├── index.css          # Landing page styles
│   ├── login.css          # Authentication styles
│   ├── lost_found.css     # Lost/Found form styles
│   └── track.css          # Tracking page styles
├── js/
│   ├── admin.js           # Admin panel logic
│   ├── auth.js            # Authentication system
│   ├── dashboard.js       # User dashboard logic
│   ├── found.js           # Found item form logic
│   ├── lost.js            # Lost item form logic
│   └── track.js           # Tracking system logic
├── images/
│   └── Untitled design.png
├── admin.html             # Admin dashboard
├── contact.html           # Contact page
├── dashboard.html         # User dashboard
├── found.html             # Found item form
├── index.html             # Landing page
├── login.html             # Login/Signup page
├── lost.html              # Lost item form
└── track_item.html        # Tracking page
```

---

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage for data persistence
- **Authentication**: Session-based with 24-hour expiration
- **Styling**: Custom CSS with responsive design
- **Icons**: Inline SVG icons

---

## 🧪 Matching Algorithm

The smart matching system uses a weighted scoring algorithm:

| Factor | Weight | Description |
|--------|--------|-------------|
| Category Match | 20% | Exact category match |
| Item Name | 30% | String similarity |
| Description | 20% | Text similarity |
| Location | 15% | Location proximity |
| Date | 15% | Time proximity |

**Total Score**: 0-100% (threshold for potential matches)

---

## 🔒 Security Features

- ✅ Session-based authentication with expiration
- ✅ Role-based access control (user/admin)
- ✅ Input sanitization to prevent XSS
- ✅ Route protection for sensitive pages
- ✅ Authorization checks for data access
- ✅ File type and size validation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test on multiple browsers
- Ensure responsive design is maintained

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for university campus communities
- Inspired by the need for efficient lost & found management
- Designed with user experience and security in mind

---

## 📞 Support

For questions, issues, or suggestions:

- 📧 Email: support@unifound.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/unifound/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/unifound/discussions)

---

## 🗺️ Roadmap

- [ ] Backend API integration
- [ ] Email notifications
- [ ] Image upload to cloud storage
- [ ] Advanced search with filters
- [ ] Report editing functionality
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] QR code generation for items

---

<div align="center">

**Made with ❤️ for Campus Communities**

[⬆ Back to Top](#unifound---campus-lost--found-platform)

</div>
