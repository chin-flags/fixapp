# CMMS Expansion Requirements

This document tracks the expanded CMMS scope where RCA is one component of the system. It mirrors the provided FR list and is used as the source for ticket breakdowns in `plans/cmms-backlog.md`.

## Scope Summary
- Internal CMMS ticketing and lifecycle management.
- RCA creation from flagged tickets and manual creation.
- Collaboration, analysis tools, approvals, reporting, and notifications.
- Role-based visibility, tenant management, and audit.
- AI-powered insights with tenant isolation.
- Integrations and migration (post-MVP items noted).

## Functional Requirements (FR)

### RCA Lifecycle Management
- FR1: Plant Operators can create corrective maintenance tickets in the internal CMMS
- FR2: System can flag corrective maintenance tickets that require RCA based on impact criteria
- FR3: Plant Operators can create RCA records from flagged maintenance tickets (pre-filled with equipment and issue data)
- FR4: Plant Operators can create RCA records manually with minimal required fields (issue description, location, equipment)
- FR5: Plant Operators can attach photos and files to RCA records during creation
- FR6: System can auto-assign RCA records to appropriate RCA Owners based on equipment type and location
- FR7: RCA Owners can view all RCAs assigned to them with current status
- FR8: RCA Owners can add team members (engineers, specialists) to RCA investigations
- FR9: System can suggest relevant team members based on equipment type, fault codes, and past participation
- FR10: RCA Owners can close RCA records after all solutions are approved and implemented
- FR11: Global Administrators can delete RCA records with audit trail
- FR12: Users can search and filter RCAs by status, location, equipment, date range, and assigned personnel

### Collaborative Investigation
- FR13: Team Members can contribute observations and findings to RCA brainstorming sessions
- FR14: Team Members can attach files (logs, photos, documents) to brainstorming contributions
- FR15: Users can comment on RCA records for collaboration and mentoring
- FR16: Country Leaders can add team members to RCAs for mentoring purposes
- FR17: System can send notifications when users are added to RCA teams

### Root Cause Analysis Tools
- FR18: RCA Owners can create fishbone (Ishikawa) diagrams for root cause analysis
- FR19: RCA Owners can edit and update fishbone diagrams throughout the investigation
- FR20: System can pre-populate fishbone diagram categories based on brainstorming content
- FR21: RCA Owners can identify root causes from analysis
- FR22: RCA Owners can define corrective action solutions for identified root causes
- FR23: RCA Owners can assign solutions to team members with due dates
- FR24: Team Members can update status of assigned solutions (in progress, completed, blocked)
- FR25: Team Members can attach evidence (photos, documents) to completed solutions

### AI-Powered Intelligence
- FR26: System can analyze historical RCA patterns to suggest relevant solutions
- FR27: System can match current RCA symptoms with similar past cases across locations
- FR28: Engineers can view AI-suggested solutions with context (equipment type, success rate, originating location)
- FR29: Engineers can accept or reject AI suggestions with feedback comments
- FR30: System can learn from engineer feedback to improve future suggestions
- FR31: Global Administrators can manually link related RCAs across locations for AI learning
- FR32: System can maintain tenant data isolation while enabling cross-tenant AI learning improvements

### Approval & Verification Workflow
- FR33: RCA Owners can submit completed solutions for approval
- FR34: RCA Owners can approve solutions assigned to their team members
- FR35: System can track approval history with timestamps and approver identity
- FR36: System can prevent RCA closure until all solutions are approved and marked complete

### Dashboards & Visibility
- FR37: Plant Operators can view their own submitted RCAs and corrective maintenance tickets
- FR38: RCA Owners can view dashboard showing pending approvals and overdue actions
- FR39: Team Members can view dashboard showing RCAs assigned to them and actions due
- FR40: Country Leaders can view all RCAs within their country with status summaries by plant
- FR41: Global Administrators can view all RCAs across all locations with filtering by country/plant
- FR42: System can display metrics including open vs closed RCAs, time to resolution, and common root causes
- FR43: System can identify and flag bottlenecks (RCAs stuck in specific phases for extended periods)
- FR44: System can identify and flag overdue actions with owner notifications
- FR45: System can detect patterns and clusters of similar issues across locations

### Notifications & Reminders
- FR46: System can send email notifications when users are assigned to RCAs
- FR47: System can send email notifications when solutions are assigned to users
- FR48: System can send reminders for actions approaching due dates
- FR49: System can send notifications when solutions are approved
- FR50: System can send notifications for comments and mentions
- FR51: System can send mobile push notifications for time-sensitive updates
- FR52: Users can configure notification preferences (email, push, frequency)

### Reporting & Export
- FR53: RCA Owners can generate professional PDF reports including fishbone diagrams, timeline, and actions
- FR54: Users can export RCA data to Excel with filtering by location, date range, and status
- FR55: Global Administrators can export cross-location analytics to Excel for executive reporting
- FR56: System can include data visualizations in exported reports (charts, trend graphs)
- FR57: Users can share RCA reports via links or file attachments

### User & Tenant Management
- FR58: Global Administrators can create and manage user accounts within their tenant
- FR59: Global Administrators can assign roles to users (Plant Operator, Team Member, RCA Owner, Country Leader, Global Admin)
- FR60: Global Administrators can configure organizational hierarchy (countries, plants, teams)
- FR61: System can enforce hierarchical visibility based on user role and location
- FR62: Users can authenticate via Office 365 SSO (SAML/OAuth)
- FR63: System can provision and de-provision users from Azure AD
- FR64: System can maintain complete audit logs of all user actions for compliance
- FR65: Tenant Administrators can configure tenant-specific settings (branding, workflow rules, notification policies)

### Corrective Maintenance (Internal CMMS)
- FR66: Plant Operators can create corrective maintenance tickets with equipment, issue description, and priority
- FR67: System can assign impact levels to maintenance tickets based on configurable criteria
- FR68: System can automatically flag high-impact tickets as requiring RCA
- FR69: Maintenance supervisors can link corrective actions from RCAs to maintenance tickets
- FR70: System can track maintenance ticket status and completion
- FR71: Users can view linked RCAs from maintenance tickets and vice versa

### Data Migration & Integration
- FR72: System can import historical RCA records from existing databases during tenant onboarding
- FR73: System can validate data integrity after migration
- FR74: System can provide RESTful API for third-party integrations (Post-MVP)
- FR75: System can send webhook notifications for RCA lifecycle events (created, completed, overdue) (Post-MVP)
- FR76: System can integrate with external SAP systems via API (Post-MVP)
