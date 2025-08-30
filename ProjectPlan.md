Develop a FiveM store using:

### Technical Requirements:
- Framework: Astro.js (v4+)
- Database: MongoDB
- Frontend: React with TypeScript
- UI Library: shadcn/ui
- Styling: Tailwind CSS

### Core Features:
1. **Multi-tier User System**:
   - Roles: Owner (single account), Admin (added by Owner), Client
   - Login: Discord + email/password
   - Profile page: Update email/password, avatar, and bio

2. **Admin Panel with Game-like UI**:
   - Orange (#FF6B00) + Black (#0F0F0F) theme
   - Full RTL support for Arabic + English
   - Sections:
     * Rule Pages Manager (create/edit/delete)
     * Job Application System (custom forms)
     * Server Information Editor ("About Server")
     * User Management (Owner only)
     * Product Management
     * Content Editor
     * Transaction Monitor

3. **Permissions System**:
   - Owner: Full privileges
   - Admins: Only granted permissions
   - No role elevation to Owner

4. **New Modules**:
   - **Dynamic Rule Pages**:
     - Categories: Admin, EMS, Police, General, Safe-Zones
     - Bilingual content editor
     - Custom ordering
   
   - **Job Application System**:
     - Create jobs (e.g., Police, Medic)
     - Toggle open/closed status
     - Custom form builder:
       - Field types: Text, Textarea, Dropdown, Checkbox
       - Required fields
       - Bilingual questions
   
   - **Server Information Page**:
     - Markdown editor (bilingual)
     - Last updated timestamp
   
   - **Custom Footer**:
     - Left: Codixverse (development team)
     - Center: Crazy Town © {year}
     - Right: Codixverse software rights

### Design Specifications:
- Immersive game-like interface
- Neon orange effects and glowing borders
- Interactive cards with hover animations
- Parallax scrolling effects
- Full RTL support for Arabic
- Responsive form layouts with validation

### Implementation Requirements:
1. Create MongoDB schemas for:
   - Users (with profile)
   - Rule Pages
   - Jobs (with custom forms)
   - Server Info
   - Products
   - Content

2. Implement:
   - Discord authentication
   - Role-based access control
   - Dynamic form field rendering
   - Bilingual content management
   - PayPal payment integration (Owner only)

3. Build UI components:
   - User profile editor
   - Rule page viewer
   - Job application forms
   - Custom form builder
   - Game-style navigation

### Special Notes:
- Prioritize Arabic RTL implementation
- Use glowing effects for interactive elements
- Ensure mobile responsiveness
- Include security measures for admin operations
- Implement the exact footer layout:
  ┌──────────────────┬──────────────────────┬──────────────────┐
  │ Codixverse      │ Crazy Town © 2024    │ © Codixverse     │
  │ Development Team│ All Rights Reserved  │ Software Rights  │
  └──────────────────┴──────────────────────┴──────────────────┘