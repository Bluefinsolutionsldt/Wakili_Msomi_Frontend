# Wakili Msomi - AI Legal Assistant

Wakili Msomi is a modern, responsive AI-powered legal assistant chatbot built with Next.js. It provides expert legal guidance, document analysis, and professional consultation with integrated payment functionality for subscription management.

## ✨ Features

### 🤖 AI-Powered Legal Assistant

- Intelligent legal queries and responses
- Document analysis and review
- Multi-jurisdiction legal support
- Real-time chat interface with typing indicators
- Conversation history management

### 💳 Integrated Payment System

- **3 Free Prompts** for new users
- Flexible subscription plans:
  - **Daily Plan (TSh 1,500)** - 24-hour access
  - **Weekly Plan (TSh 8,000)** - 7-day access with advanced features
  - **Monthly Plan (TSh 25,000)** - 30-day access with premium features
- M-Pesa integration for Tanzanian users
- Real-time subscription status tracking
- Automatic prompt counting and restrictions

### 🎨 Modern UI/UX

- Responsive design for mobile and desktop
- Dark theme with golden accent colors (`#FFD45E`)
- Smooth animations with Framer Motion
- Touch-optimized interface
- Modern gradient designs and glassmorphism effects

### 🔒 User Authentication

- Secure user registration and login
- JWT-based authentication
- User profile management
- Session persistence

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React, Heroicons
- **State Management**: React Context API
- **Authentication**: JWT tokens
- **Backend**: FastAPI integration (external)

## 📱 Screenshots & Demo

The app features a modern chat interface with:

- Welcoming onboarding for new users
- Clear subscription status indicators
- Elegant payment modal with plan selection
- Responsive design that works on all devices
- Real-time chat with the AI assistant

## 🛠️ Getting Started

1. **Clone the repository**

```bash
git clone [repository-url]
cd sheriabot1.0-main
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
├── app/
│   ├── api/           # API routes (auth, payments, conversations)
│   ├── globals.css    # Global styles and CSS variables
│   └── page.tsx       # Main application page
├── components/
│   ├── auth/          # Authentication components
│   ├── ui/            # Reusable UI components
│   ├── Chat.tsx       # Main chat interface
│   ├── SideBar.tsx    # Conversation sidebar
│   ├── Topbar.tsx     # Navigation header
│   └── SubscriptionModal.tsx  # Payment modal
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── services/
│   └── api.ts         # API service layer
├── types/
│   ├── auth.ts        # Authentication types
│   └── api-types.ts   # API interface types
└── utils/             # Utility functions
```

## 💰 Subscription Plans

### Free Tier

- 3 free prompts for new users
- Basic legal queries
- Standard response time

### Daily Plan (TSh 1,500)

- Unlimited legal queries
- Priority AI responses
- Document analysis
- 24/7 access

### Weekly Plan (TSh 8,000) - **Most Popular**

- Everything in Daily
- Advanced legal templates
- Multi-jurisdiction support
- Chat history export
- Email support

### Monthly Plan (TSh 25,000)

- Everything in Weekly
- Dedicated legal consultation
- Custom document drafting
- Priority phone support
- Case tracking
- Legal calendar integration

## 🔌 API Integration

The app integrates with a FastAPI backend providing:

- User authentication (`/register`, `/token`)
- User management (`/users/me`)
- Conversation handling (`/conversations`, `/query`)
- Payment processing (`/create-subscription-order`)
- Subscription management

## 🎯 Key Features Implementation

### Prompt Limitation System

- Automatic prompt counting for free users
- Real-time UI updates showing remaining prompts
- Graceful upgrade prompts when limits reached
- Subscription-based unlimited access

### Payment Integration

- M-Pesa payment gateway integration
- Real-time payment status tracking
- Automatic subscription activation
- Multiple plan options with different durations

### Responsive Chat Interface

- Mobile-first design approach
- Touch-optimized interactions
- Smooth scrolling and animations
- Context-aware input states

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service. Make sure to configure environment variables for the backend API URL.

## 📞 Support

For additional assistance, users can contact:
**Phone**: +255 621 900 555

## 🤝 Contributing

This project is part of a legal tech initiative to make legal assistance more accessible in Tanzania and East Africa.

---

Built with ❤️ using Next.js and modern web technologies.
