# **Requirements Document**

## **Project Name: Sauti - A Platform for Democratic Participation in Kenya**

---

### **Overview**

Sauti aims to foster full and increased democratic participation for Kenyan citizens by connecting voters, representatives, political parties, NGOs, and CBOs on a single digital platform. This document outlines all user stories across various functionalities and features. The quality and scope reflect the needs of a unicorn startup.

---

## **User Stories**

### **1. User Onboarding**

#### **As a Kenyan Citizen:**

1. **Sign-Up**:
   - As a user, I want to register using email, so that I can access all platform features.
2. **Profile Completion**:
   - As a user, I want to input additional information like my county, constituency, ward, and year of birth during registration so that the platform customizes my experience.

#### **As an NGO or CBO Representative:**

3. **Sign-Up**:
   - As an NGO or CBO, I want to register with my organization’s certificate and contact details so that I can engage citizens effectively.

#### **As a Representative:**

4. **Sign-Up**:
   - As a political representative, I want to register and verify my account with credentials so that I can connect with my constituents transparently.

---

### **2. User Verification**

#### **For All Users:**

5. **Email Verification**:
   - As a user, I want to receive a verification email during sign-up so that my account is validated securely.
6. **ID Verification**:
   - As a user, I want to verify my ID via KYC so that I can access sensitive features like messaging.

#### **For Verified Users:**

7. **Restricted Access**:
   - As a user, I want restricted features (e.g., messaging representatives or posting in forums) to remain locked until my account is fully verified.

---

### **3. Messaging (DMs)**

#### **For Verified Users:**

8. **Send DMs**:
   - As a voter, I want to DM my representatives so that I can raise concerns or ask questions about governance.
9. **Receive DMs**:
   - As a representative, I want to receive DMs from my constituents so that I can address their issues directly.
10. **Follow-to-DM**:
    - As a user, I want to DM other users only if we mutually follow each other, ensuring privacy and preventing spam.

---

### **4. Civic Engagement**

#### **For All Users:**

11. **View Representatives**:
    - As a user, I want to see a list of representatives by county, constituency, and ward so that I can identify my leaders.
12. **Search Representatives**:
    - As a user, I want to search for representatives by name, party, or region so that I can find specific individuals easily.
13. **Follow Representatives**:
    - As a user, I want to follow my representatives so that I receive their updates in my feed.

#### **For Representatives:**

14. **Post Updates**:
    - As a representative, I want to post updates about projects, bills, and events so that my constituents stay informed.
15. **Engage Constituents**:
    - As a representative, I want to engage in public discussions with my constituents to understand their opinions on governance issues.

---

### **5. Forums and Discussions**

#### **For Verified Users:**

16. **Post in Forums**:
    - As a user, I want to post in forums so that I can engage in political discourse.
17. **Upvote/Downvote Posts**:
    - As a user, I want to upvote or downvote posts in forums so that high-quality content is prioritized.
18. **Comment on Posts**:
    - As a user, I want to comment on posts so that I can participate in discussions.
19. **Reshare Posts**:
    - As a user, I want to reshare posts so that I can amplify important conversations.

---

### **6. Prediction Market**

#### **For All Users:**

20. **View Predictions**:
    - As a user, I want to see trending predictions about political events so that I can engage in informed discussions.
21. **Participate in Predictions**:
    - As a user, I want to place bets on predictions using tokens so that I can participate in the platform’s gamification.

---

### **7. Notifications**

#### **For All Users:**

22. **Receive Notifications**:
    - As a user, I want to receive notifications for DMs, followed representatives’ updates, and forum activity so that I stay engaged.

---

### **8. Security and Moderation**

#### **For All Users:**

23. **Report Abuse**:
    - As a user, I want to report inappropriate messages or forum posts so that the platform remains a safe space.
24. **Block Users**:
    - As a user, I want to block other users from messaging me so that I control my interactions.

---

### **9. Analytics**

#### **For Representatives:**

25. **Engagement Metrics**:
    - As a representative, I want to see engagement analytics (e.g., message counts, forum interactions) so that I understand my constituents better.

#### **For Users:**

26. **Forum Stats**:
    - As a user, I want to see the number of upvotes, comments, and reshares on my posts so that I gauge my influence.

---

### **10. Admin Features**

#### **For Platform Administrators:**

27. **User Moderation**:
    - As an admin, I want to manage user accounts and moderate content so that the platform adheres to its guidelines.
28. **System Monitoring**:
    - As an admin, I want to monitor system performance and detect bottlenecks so that the platform runs smoothly.
29. **User Role Management**:
    As a platform administrator, I want to manage user roles and permissions so that I can control access to platform features and maintain a secure, organized system.

Acceptance Criteria:
Assign Roles:
Admin can assign predefined roles to users (e.g., Citizen, Representative, NGO/CBO, Moderator, Super Admin).
Update Roles:
Admin can modify a user's role (e.g., promote a Citizen to Moderator or revoke a Representative’s status).
Revoke Roles:
Admin can remove all roles from a user to limit their access to platform features.
Permissions:
Admin can define custom permissions for roles (e.g., allow Moderators to approve posts but restrict them from managing roles).
View Roles:
Admin can view the current role and permissions of any user in the system.
Audit Logging:
All role changes are logged with details like the admin who made the change, the user affected, and the timestamp for traceability.
Role Limits:
Roles must adhere to specific rules (e.g., only one representative per constituency).
Functional Requirements:
Backend:
backend/src/models/UserRole.js: Define role schemas and permissions.
backend/src/controllers/adminController.js: Create endpoints for role management.
backend/src/routes/adminRoutes.js: Define routes for role management (e.g., /assign-role, /update-role, /revoke-role).
Frontend:
frontend/src/pages/Admin/RoleManagementPage.jsx: Create a UI for role assignment and management.
frontend/src/features/admin/adminAPI.js: Handle API calls for role management.
frontend/src/features/admin/adminSlice.js: Manage admin state for roles and permissions.
Non-Functional Requirements:
Security:
Only Super Admins can modify roles and permissions.
Role updates should use two-factor authentication for added security.
Scalability:
The system should handle thousands of users with minimal performance impact during role queries or updates.
Scenario Examples:
Assign Role to Representative:
Admin selects a user who registered as a representative, assigns them the "Representative" role, and links them to their constituency and county.
Promote User to Moderator:
Admin promotes a verified citizen to a Moderator role to help moderate forums and discussions.
Revoke NGO Role:
Admin removes the "NGO" role from a user due to certificate verification failure.
Additional Notes:
Admin actions related to roles should trigger notifications to the affected users.
An audit trail must be accessible to Super Admins for compliance purposes.
Would you like additional details on the permissions hierarchy or implementation specifics for role-based access control (RBAC)?

---

### **Additional User Stories**

#### **Scalability and Accessibility:**

29. **Mobile-Friendly Design**:
    - As a user, I want a mobile-responsive platform so that I can access it on any device.
30. **Language Options**:
    - As a user, I want to switch between English and Swahili so that the platform accommodates all Kenyans.

#### **Monetization:**

31. **Subscription Model**:
    - As an NGO, I want premium features (e.g., detailed analytics) available via subscription so that I can better engage citizens.

---

### **Requirements Breakdown**

#### **Critical Features**:

- User onboarding and verification
- Messaging (DMs)
- Forums and discussions
- Notifications

#### **Optional but Desirable**:

- Prediction market
- Civic engagement analytics
- Mobile-friendly UI

#### **Future Considerations**:

- AI-driven moderation for forums and messages.
- Regionalized updates based on the user’s location.

---

This document ensures all stakeholders—users, representatives, NGOs, and administrators—have clear expectations of the system. **Would you like me to expand on specific features or add user personas for better clarity?**
