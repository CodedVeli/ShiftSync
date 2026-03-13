# ShiftSync Frontend

React-based UI for multi-location staff scheduling system.

## Tech Stack

- React + TypeScript
- Vite
- Ant Design
- TanStack Query
- Zustand (state management)
- Socket.io client

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
pnpm dev
```

## Environment Variables

```
VITE_API_URL=http://localhost:3000
```

## Test Accounts

Use these credentials to test different roles:

- **Admin**: admin@test.com / password
  - Access: All features, all locations

- **Manager (SF Locations)**: manager1@test.com / password
  - Access: Schedule, assign staff, approve swaps for SF locations

- **Manager (NY Locations)**: manager2@test.com / password
  - Access: Schedule, assign staff, approve swaps for NY locations

- **Staff**: staff1@test.com / password
  - Access: View schedule, set availability, request swaps

## Testing Evaluation Scenarios

### 1. Sunday Night Chaos (Find Coverage)
- Login as Manager
- Go to Schedule page
- Find a shift with unfilled positions
- Click "Find Coverage"
- System shows qualified staff sorted by weekly hours
- Assign recommended staff

### 2. Overtime Trap (Manager Override)
- Login as Manager
- Try to assign staff who already has 48+ hours
- System blocks with error: "Would exceed 40h limit (52h total, 12h overtime)"
- Click "Override and Assign"
- Enter reason for override
- Assignment succeeds, logged in audit trail

### 3. Timezone Tangle (Multi-timezone)
- Login as Staff
- Go to Availability page
- Set availability "9am-5pm" (stored as time strings)
- System validates SF shifts against 9am-5pm Pacific
- System validates NY shifts against 9am-5pm Eastern
- Both are valid, staff can work same clock hours at different locations

### 4. Simultaneous Assignment (Concurrency)
- Open two browser windows as different managers
- Both try to assign same staff to different shifts at same time
- First assignment succeeds
- Second gets real-time conflict notification
- System shows alternative suggestions

### 5. Fairness Complaint (Analytics)
- Login as Manager/Admin
- Go to Analytics page
- View "Schedule Fairness" table
- Sort by "Premium Shifts" column
- See staff member with 4 Saturday nights vs team average ~2
- Visual proof for fairness discussion

### 6. Regret Swap (Cancel Request)
- Login as Staff A
- Go to Schedule page
- Click "Request Swap" on assigned shift
- Select Staff B as target
- Staff B receives notification
- Staff A goes to Swap Requests page
- Click "Cancel" on pending request
- Staff B receives cancellation notification
- Manager's swap list updates in real-time

## Features by Role

### Admin
- Full access to all locations
- View analytics and audit logs
- Manage all schedules and assignments

### Manager
- Manage shifts at assigned locations only
- Assign/unassign staff
- Override constraint violations with reason
- Approve/reject swap requests
- View analytics and audit logs
- Publish weekly schedules

### Staff
- View personal schedule
- Set availability windows
- Request shift swaps
- Accept incoming swap requests
- View notifications
- Cancel own swap requests

## Real-time Features

The app uses WebSocket for instant updates:
- New shift assignments appear immediately
- Swap request notifications delivered instantly
- Schedule changes broadcast to all viewers
- Conflict detection for concurrent operations

## Build & Deploy

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy to Vercel/Netlify/Cloudflare Pages
# Point to the 'dist' folder
```

## Project Structure

```
src/
├── api/              # API client and hooks
├── components/       # Reusable components
│   ├── auth/        # Auth components
│   ├── layout/      # Layout wrapper
│   └── shifts/      # Shift-specific components
├── pages/           # Page components
├── store/           # Zustand stores
└── lib/             # Utilities
```

## Known Limitations

- No offline mode
- Desktop/tablet optimized (mobile responsive but not native)
- Real-time updates require active connection
