---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/prd.md'
workflowType: 'ux-design'
lastStep: 8
project_name: 'fixapp'
user_name: 'Chinthakaweerakkody'
date: '2025-12-22'
---

# UX Design Specification fixapp

**Author:** Chinthakaweerakkody
**Date:** 2025-12-22

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

fixapp transforms Root Cause Failure Analysis from a compliance burden into a competitive advantage for manufacturing organizations. It delivers an action-oriented, intelligent system that eliminates friction between identifying a problem and resolving it. Instead of forcing users to navigate overwhelming interfaces and irrelevant data, fixapp presents exactly what each user needs to act on right now. The AI-powered knowledge base transforms isolated incidents into organizational learning - when an engineer in one plant faces an issue, they immediately benefit from solutions discovered across the entire manufacturing network.

### Target Users

**Plant Operators:** Frontline manufacturing floor personnel who create and report issues. They need fast, mobile-friendly interfaces that work in harsh environments (noisy, wearing gloves, standing). Success means submitting an RCA in under 2 minutes with minimal form fields and immediate confirmation.

**RCA Owners (Engineers):** Mechanical, electrical, and process engineers who lead root cause investigations. They coordinate teams, create fishbone diagrams, and drive resolution. They need desktop power tools, AI-powered solution suggestions from the knowledge base, and professional reporting capabilities. Success means staying in control of the RCA process with nothing falling through the cracks.

**Team Members (Engineers/Specialists):** Cross-functional contributors who provide expertise during investigations and implement assigned solutions. They need clear visibility into their assigned work, easy contribution mechanisms, and recognition for their input. Success means their expertise is valued and tracked.

**Country Leaders:** Regional operations managers overseeing multiple plants within their country/region. They need strategic visibility without micromanaging - spotting bottlenecks, overdue actions, and knowledge gaps. Success means having full confidence in what's happening across their region without drowning in details.

**Global Administrators:** Enterprise operations leaders managing multi-country manufacturing programs. They need cross-location pattern detection, trend analysis, and executive-level reporting. Success means spotting patterns across regions instantly and enabling organizational learning at scale.

### Key Design Challenges

**Multi-role complexity:** Designing one cohesive system that serves five distinct user types with vastly different needs and contexts. Plant operators need simplicity and speed on mobile devices in harsh environments, while global administrators need sophisticated analytics and cross-location intelligence on desktop. The challenge is creating role-appropriate experiences without fragmenting the product or compromising any user's needs.

**Mobile + Desktop parity:** Plant floor usage demands mobile-first design (touch targets for gloved hands, high contrast for bright environments, minimal typing), while complex analysis tasks require desktop power tools (fishbone diagram editors, multi-panel dashboards, Excel exports). Both contexts must feel native and purposeful, not like compromised versions of each other.

**Progressive disclosure at scale:** Implementing hierarchical data visibility (global → country → plant → team) that feels natural rather than restrictive. Each user should see appropriately scoped information that empowers their decision-making without feeling blocked from relevant context. The system must surface the right level of detail for each role without overwhelming or under-informing.

### Design Opportunities

**Action-oriented intelligence:** Move beyond traditional metric-heavy dashboards to create context-aware interfaces that show each user exactly what needs their attention right now. Instead of "42 open RCAs across 5 countries," show "3 pending your approval" or "1 bottleneck at Puttalam plant - stuck 8 days." This transforms data into actionable insight.

**AI as collaborative assistant:** Position AI suggestions as helpful peer insights rather than black-box automation. When the system suggests "Similar issue resolved in Vietnam - voltage regulator solution," it frames AI as connecting human expertise across locations, not replacing engineering judgment. This builds trust and encourages adoption while maintaining the human-in-the-loop validation that improves the AI over time.

**Invisible hierarchy:** Design data scoping that feels like natural focus rather than artificial restriction. Country leaders see their region not because they're "blocked" from global data, but because the interface intelligently presents their scope of responsibility. This creates clarity without the frustration of hitting permission walls.

## Core User Experience

### Defining Experience

The core experience of fixapp is built around **"seeing what needs my attention and taking action immediately."** This principle applies universally across all user roles, manifesting differently for each context:

- **Plant Operators:** "High-impact ticket detected → Create RCA now?" (90-second workflow)
- **RCA Owners:** "3 pending approvals, 2 overdue actions" (clear action list on dashboard)
- **Team Members:** "2 actions due this week" (focused task view)
- **Country Leaders:** "1 bottleneck at Puttalam plant - stuck 8 days" (strategic intervention points)
- **Global Administrators:** "3 plants, same VRM issue - Vietnam already solved it" (pattern-based insights)

The transition from "seeing what needs attention" to "taking action on it" must be seamless across all user types. This is the core interaction loop that defines fixapp's value - making RCA management feel like continuous forward motion rather than administrative overhead.

### Platform Strategy

**Multi-platform responsive web application** serving desktop, tablet, and mobile devices through browser-based access, with future consideration for native iOS/Android apps in the vision phase.

**Hybrid interaction model:**
- **Touch-first for plant floor contexts:** Large touch targets for gloved hands, high contrast for bright manufacturing environments, visual feedback for noisy settings, camera integration for evidence capture
- **Mouse/keyboard precision for analysis contexts:** Desktop power tools for fishbone diagram creation, multi-panel dashboards, Excel exports, detailed data exploration

**Connectivity considerations:**
- **Primary mode:** Online with real-time collaboration and live updates
- **Offline resilience:** View-only access to recent RCAs and ability to create draft submissions that sync when connectivity returns
- **Progressive loading:** Critical actions (create RCA, update status) prioritized over analytics and historical data

**Device-specific capabilities:**
- **Camera:** One-tap photo capture automatically attached to RCA context
- **Push notifications:** Time-sensitive alerts for assignments, approvals, and overdue actions
- **Location services:** Auto-populate plant location during RCA creation
- **Biometric authentication:** Quick access via fingerprint/face unlock for frequent plant floor usage

### Effortless Interactions

**Zero-navigation action discovery:** Users open the app and immediately see what needs their attention without searching menus or clicking through hierarchies. The right information surfaces based on role, location, and current context.

**Context propagation across workflows:** Data flows automatically from maintenance ticket → RCA creation → team assignment → notifications without re-entry. Equipment details, location, impact level, and issue description carry through the entire lifecycle.

**Contextual AI assistance:** Solution suggestions appear at the right moment during analysis (not intrusively on every screen). When Rajesh builds a fishbone diagram, the system offers "Vietnam solved similar VRM issue - see RCA-V2103" with relevant context and success indicators.

**Intelligent auto-assignment:** System suggests appropriate RCA owners and team members based on equipment type, fault patterns, location, and historical participation. Users can accept, modify, or override - but the default should be right 80%+ of the time.

**One-tap status progression:** Completing an action, approving a solution, or updating RCA status happens with a single interaction plus optional comment. No multi-step forms for routine updates.

**Automatic state transitions:** RCA status moves from "Brainstorming" to "Analysis" when fishbone created, from "Solutions Pending" to "Awaiting Approval" when all actions completed. Users focus on work, system tracks progress.

**Smart defaults eliminate dropdown hunting:** Instead of cascading Country → Region → Plant → Equipment dropdowns, use intelligent defaults from user profile, recent activity, and current location. Users only adjust when necessary.

**Instant professional reporting:** Generate presentation-ready PDF reports from RCA data with one tap. No manual PowerPoint creation - fishbone diagrams, timelines, actions, and status automatically formatted for management review.

### Critical Success Moments

**First impression success (Operators):** Priya taps "Create RCA" on a high-impact maintenance ticket and sees the form 80% pre-filled with equipment, location, and issue details. She realizes "this will take 90 seconds, not 15 minutes" and commits to using the system.

**AI credibility moment (RCA Owners):** Rajesh receives his first AI suggestion while building a fishbone diagram - it references Vietnam's voltage regulator solution that's actually relevant to his VRM failure. He thinks "this system is learning across our organization" and begins trusting AI recommendations.

**Pattern discovery moment (Global Admins):** Vikram opens his dashboard Monday morning and immediately spots three plants across different countries with similar VRM failures. He realizes "I can see patterns I'd miss in spreadsheets" and understands the cross-location intelligence value.

**Recognition moment (Team Members):** Anika completes a voltage monitoring installation and sees "Your action approved - prevented 2 more shutdowns this week." Her contribution is documented, acknowledged, and visibly impactful.

**Control without micromanagement (Country Leaders):** Sanduni identifies a bottleneck at Puttalam plant (stuck 8 days in brainstorming) and adds a mentor without taking over. She realizes "I have visibility and can help without becoming the bottleneck."

**Critical failure scenarios to prevent:**
- **Slow RCA creation (>2 minutes):** Operators abandon system and return to informal reporting
- **Irrelevant AI suggestions:** Users lose trust and ignore all future AI recommendations
- **Lost context (re-entry friction):** Frustration kills adoption when users repeat information
- **Wrong visibility (hierarchy breaks):** Country leaders see other countries' data or miss critical issues in their region

### Experience Principles

**1. Action-first, data-second:** Every interface answers "what do I need to do right now?" before showing metrics or history. Users see their next action immediately, not after navigating through dashboards. Analytics support decisions, they don't replace clear direction.

**2. Context flows, never re-enter:** Information moves seamlessly through the system from maintenance ticket to RCA to team assignment to notifications. Users never re-type what the system already knows. Smart defaults and data propagation eliminate redundant entry.

**3. Intelligence amplifies expertise, never replaces it:** AI suggestions appear at the right moment with helpful context ("Vietnam solved this - voltage regulator solution"), but engineers always make the final decision. The system learns from their expertise through acceptance/rejection feedback, becoming smarter over time while keeping humans in control.

**4. Platform adapts to context, not vice versa:** Mobile interfaces are touch-first for plant floor use with large targets and gloves-friendly design. Desktop interfaces leverage precision tools for complex analysis like fishbone diagrams and multi-panel dashboards. Users don't compromise - they get the right interface for their context.

**5. Hierarchy enables focus, not restriction:** Each user sees their appropriate scope (plant, country, global) as natural focus, not blocked access. Country leaders see their region clearly without feeling limited by permission walls. Data scoping feels like intelligent filtering, not artificial barriers.

**6. Speed is a feature, not a metric:** Under 2-second page loads and 90-second RCA creation aren't just performance targets - they're fundamental to the experience. Slow equals broken. Every interaction must feel immediate and responsive, particularly for time-sensitive plant floor usage.

## Desired Emotional Response

### Primary Emotional Goals

Users should feel **confident, in control, and efficient** throughout their RCA workflow. fixapp positions itself as an intelligent assistant that amplifies user expertise rather than adding administrative burden. The system creates an emotional shift from feeling overwhelmed by compliance requirements to feeling empowered by actionable intelligence.

**Core emotional experience:**
- **Plant Operators:** Relief and confidence that issues are properly reported and will be handled
- **RCA Owners:** Control and mastery over the investigation process with nothing falling through cracks
- **Team Members:** Valued and recognized for contributions with visible impact
- **Country Leaders:** Strategic clarity and confidence in regional visibility without micromanaging
- **Global Administrators:** Proactive intelligence and pattern discovery that enables staying ahead of problems

### Emotional Journey Mapping

**Discovery Phase (First Encounter):**
- **Initial reaction:** Hopeful skepticism → "Could this actually be better than our current system?"
- **After first login:** Immediate clarity → "I can see exactly what needs my attention - this is different"
- **First success moment:** Surprised delight → "That was so much easier than I expected"

**Active Use (Core Experience):**
- **Creating RCA (Operators):** Effortless flow with no friction, just capturing what happened naturally
- **Investigating (RCA Owners):** Focused intelligence where system supports thinking without distraction
- **Contributing (Team Members):** Meaningful participation with input valued and visible to team
- **Monitoring (Leaders):** Strategic confidence with clear visibility and no information overload

**Completion (Task Accomplished):**
- **Accomplished and confident:** "I got that done and I know it's handled correctly"
- **Trusted by the system:** "It knew what I needed and helped me get there"
- **Recognized for contribution:** "My work is visible and valued by the team"

**Error Recovery (When Things Go Wrong):**
- **Not:** Panic, confusion, or feeling lost in the system
- **Instead:** Guided recovery with clear error messages that help solve the problem immediately
- **Supported:** "The system tells me what went wrong and exactly how to fix it"
- **Example:** "Photo couldn't upload - check your connection. We saved your draft so you won't lose any data."

**Return Usage (Building Habits):**
- **Anticipation rather than dread:** "Let me check what needs my attention" vs. "Ugh, I have to log into the RCA system"
- **Familiar confidence:** "I know exactly where to go and what to do"
- **Progressive competence:** "I'm getting faster at this every time I use it"
- **Habit formation:** fixapp becomes the natural first action when issues arise

### Micro-Emotions

**Confidence over Confusion (CRITICAL):**
Users feel confident at every interaction point. Operators are confident their RCA reaches the right person. RCA Owners are confident they haven't missed critical steps. Engineers are confident contributions are captured correctly. Leaders are confident their view is accurate and complete.

**Trust over Skepticism (CRITICAL for AI adoption):**
Users trust AI suggestions are relevant and helpful, not random or forced. Trust that data is accurate and current. Trust that visibility boundaries show the complete picture for their scope. Transparency builds this trust - never hide how the system makes decisions.

**Accomplishment over Frustration (CRITICAL):**
Every interaction ends with accomplishment, not frustration. Small wins matter: "RCA created," "Action completed," "Report generated." Users experience continuous forward progress, never dead ends or confusion about next steps.

**Belonging over Isolation (CRITICAL for collaboration):**
Users feel connected to investigation teams and the broader organization. Engineers across different countries learn from each other. Individual contributions are visible within team context. Cross-location solution sharing creates organizational belonging.

**Delight through Satisfaction:**
Primary emotion is satisfaction from efficient work completion. Occasional delight comes from unexpected helpfulness - AI suggestion at perfect moment, auto-populated form saving time. Don't force "fun" into serious work context; exceed expectations in meaningful ways.

**Calm Focus over Anxiety:**
Users feel calm and focused, not anxious about missing information or making mistakes. Progressive disclosure reveals advanced features when needed. Undo capabilities and safe experimentation remove fear. Clear visual feedback prevents uncertainty.

### Design Implications

**Creating Confidence:**
- Immediate confirmation messages: "RCA-2847 created and assigned to Rajesh Mehta"
- Visual progress indicators: Clear status badges (Brainstorming → Analysis → Solutions → Approved)
- Pre-validation: System checks data before submission and flags issues early
- Undo/edit capabilities: Users can correct mistakes without anxiety
- Clear next steps: "3 actions pending your approval" not just "3 pending items"

**Building Trust:**
- Transparent AI reasoning: "Similar to Vietnam RCA-V2103 (VRM voltage issue, 95% match)" - show why it's relevant
- Data freshness indicators: "Updated 2 minutes ago" or "Real-time" badges
- Visible scope boundaries: "Viewing: Sri Lanka (4 plants)" - clear what they're seeing
- Audit trails: Who did what when builds institutional trust
- Human override always available: AI suggests, humans decide and learn

**Fostering Accomplishment:**
- Micro-celebrations: Subtle, professional success animations when completing actions
- Progress visibility: "5 of 7 actions completed" with visual progress bar
- Impact metrics: "Your solution prevented 2 shutdowns this week"
- Professional outputs: One-tap PDF generation that looks impressive in meetings
- Clear completion states: Visual distinction between done/in-progress/pending

**Enabling Belonging:**
- Team member avatars: See who's involved in the investigation
- Attribution of contributions: "Anika identified voltage fluctuations" in activity timeline
- Cross-location connections: "This solution helped 3 other plants" visibility
- Comment threads: Conversational collaboration, not isolated data entry
- @mentions and notifications: Feel connected to team activity in real-time

**Avoiding Negative Emotions:**
- No loading spinners >2 seconds (creates anxiety and impatience)
- No "Error: Invalid input" without explanation (creates confusion and frustration)
- No data re-entry across screens (creates frustration and wastes time)
- No irrelevant notifications (creates distrust in notification system)
- No hidden required fields (creates confusion when submission fails)
- No permission walls without context (creates feeling of arbitrary restriction)

**Moments of Delight:**
- Smart auto-complete: System predicts equipment names after 2 characters
- Contextual help that disappears: Tips appear for first-time actions, then fade away
- Perfect AI suggestions: When AI delivers relevant solution at exactly the right moment
- One-tap reports: Generate professional PDF faster than expected
- Proactive bottleneck detection: System notices stuck RCA before leader searches for it

### Emotional Design Principles

**1. Confidence through clarity:** Every screen answers "what do I need to do?" and "what happens next?" without ambiguity. Visual feedback confirms actions immediately. Progress is always visible. Users never wonder if something worked.

**2. Trust through transparency:** Show the system's reasoning, especially for AI suggestions. Data sources and freshness are always visible. Scope boundaries are clear. Users understand why they see what they see and can verify accuracy.

**3. Accomplishment through progression:** Break complex workflows into clear steps with visible milestones. Celebrate completions appropriately (professional, not childish). Show impact of contributions. Users feel they're making measurable progress.

**4. Belonging through attribution:** Make individual contributions visible to teams. Connect solutions across locations with credit to originators. Enable conversational collaboration. Users feel part of something larger than their immediate task.

**5. Calm focus through progressive disclosure:** Show what's needed now, reveal advanced features when relevant. Don't overwhelm with everything at once. Provide safety nets (undo, auto-save, drafts). Users feel in control, not drowning.

**6. Delight through intelligent anticipation:** Predict user needs and provide helpful shortcuts. Auto-populate based on context. Surface relevant suggestions at the right moment. Exceed expectations in small, meaningful ways that respect the serious work context.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**SAP (Enterprise Resource Planning)**

Users of fixapp are deeply familiar with SAP, which sets critical context for UX expectations and opportunities. SAP excels at comprehensive data management, hierarchical permissions, audit trails, and enterprise-grade reliability - all table stakes for fixapp. However, SAP's complex navigation, overwhelming interfaces, steep learning curve, and multi-click workflows create significant user frustration.

**Key insight:** Users are accustomed to complexity, so when fixapp delivers simplicity and speed, the contrast will be dramatic and highly appreciated. The opportunity is to maintain SAP's enterprise rigor while eliminating its usability penalties.

**Office 365 (Outlook, Teams, SharePoint, Excel)**

The Office 365 ecosystem represents users' daily workflow tools and establishes familiar interaction patterns:

**Outlook** demonstrates action-oriented design excellence. The focused inbox prioritizes "what needs action" over "everything," quick actions (flag, archive, reply) work without opening full emails, and notifications drive immediate response. Users trust Outlook's model for handling high-volume information with clear priorities.

**Teams** provides real-time collaboration through @mentions triggering targeted notifications, threaded conversations maintaining context, file attachments staying connected to discussions, and status indicators showing team availability. Users expect this level of collaborative fluidity.

**Excel** serves as the power user's trusted analysis tool. Users export data for custom pivot tables and reports, trusting their own analysis over pre-built dashboards. This export capability is non-negotiable for leaders like Vikram who need executive reporting flexibility.

**SharePoint** establishes expectations for document versioning, audit trails, and integration within the Microsoft ecosystem. Users trust Office 365 SSO and expect seamless authentication.

**Key insight:** fixapp must integrate naturally into the Office 365 ecosystem (SSO, document storage) while borrowing interaction patterns users already understand (collaboration, notifications, exports).

### Transferable UX Patterns

**Navigation Patterns:**
- **Outlook's focused inbox model** → Adapt to fixapp's action-first dashboards showing "what needs my attention now" instead of comprehensive data dumps
- **Teams' persistent sidebar** → Enable quick access to key functions (create RCA, my actions, notifications) without losing context or navigating away from current work
- **Excel's ribbon interface** → Implement context-sensitive toolbars that show relevant actions based on current task (RCA creation shows different tools than analysis phase)

**Interaction Patterns:**
- **Outlook quick actions (flag, archive, delete)** → Translate to one-tap RCA status updates without full page navigation - "Mark Complete," "Approve," "Request Changes" as immediate actions
- **Teams @mentions** → Enable direct notification system for RCA collaboration - RCA owners can pull in specific experts with context
- **Teams threaded comments** → Organize conversation within RCA context, eliminating scattered email chains and consolidating discussion history
- **Excel's auto-save** → Implement draft auto-save to prevent data loss, critical for plant floor usage with potential connectivity interruptions

**Visual Patterns:**
- **Teams status indicators (online/busy/away)** → Adapt to RCA status badges (Brainstorming/Analysis/Solutions/Approved) with color coding for immediate recognition
- **Outlook unread counts** → Display action counts on dashboard ("3 pending approvals," "2 overdue actions") rather than generic metrics
- **Excel conditional formatting** → Apply visual highlighting to overdue actions, bottlenecks, high-priority items for at-a-glance status assessment

**Data Patterns:**
- **Excel export capability** → Essential for power users like Vikram who need custom analysis and executive reporting beyond built-in dashboards
- **SharePoint document versioning** → Maintain comprehensive audit trail of RCA changes, updates, and decision history
- **Office 365 SSO** → Leverage seamless authentication users already trust, reducing friction and security concerns

### Anti-Patterns to Avoid

**SAP's Complexity Failures:**
- **Multi-level navigation hierarchies** (Plant → Equipment → Category → Subcategory → Item) → fixapp uses direct access, search, and smart suggestions instead of forcing users through rigid taxonomies
- **Transaction codes and cryptic abbreviations** (VA01, MM03, T-codes) → fixapp commits to plain language and clear labels that manufacturing teams understand without training
- **Overwhelming forms with 50+ fields** → fixapp uses smart defaults and progressive disclosure, showing 5 essential fields initially and revealing additional options only when needed
- **Slow page transitions** (3-5 second loads between screens) → fixapp commits to <2 seconds, treating speed as a core feature not just a metric
- **Modal-heavy workflows** (popup after popup after popup) → fixapp uses inline editing and contextual panels that maintain user context and flow

**Office 365's Challenges:**
- **Notification overload** (Teams pinging constantly, drowning signal in noise) → fixapp sends only actionable notifications tied to user responsibilities, never ambient activity
- **Scattered context** (discussion in email, then Teams, then documents in SharePoint) → fixapp keeps everything within the RCA record as single source of truth
- **Over-reliance on search** (can't find files in SharePoint without perfect keyword memory) → fixapp uses clear hierarchies, recent items, and contextual access patterns

**General Enterprise Anti-Patterns:**
- **Feature bloat** (every request becomes a new feature) → Every feature must justify its cognitive load against the "action-first" principle
- **Jargon and acronyms** (assuming users know internal terminology) → Use manufacturing context language, not software abstraction
- **Tutorial dependency** (requires training to use basic features) → Core workflows must be intuitive on first use, advanced features can have contextual help

### Design Inspiration Strategy

**What to Adopt:**
- **Outlook's action-oriented approach** → Dashboard prioritizes "what to do" over "what to know," with clear calls-to-action for every item requiring user attention
- **Teams' real-time collaboration** → Live updates when team members contribute to brainstorming, add solutions, or complete actions - maintain awareness without manual refreshing
- **Excel's data export power** → Give power users their raw data for custom analysis, pivot tables, and executive reporting - never force-fit everyone into pre-built dashboards
- **Office 365's familiar patterns** → Leverage existing mental models users already know (auto-save, comments, @mentions, status badges, SSO) to reduce learning curve

**What to Adapt:**
- **Teams' notification model** → Use for critical actions only (assignments, approvals, overdue items), not ambient activity - prevent notification fatigue while maintaining urgency for important items
- **SAP's audit trails** → Keep the comprehensive rigor and compliance capability, but present it through simple activity timelines and searchable history, not complex transaction logs
- **Excel's flexibility** → Provide one-click export for power users, but ensure built-in dashboards work excellently out of the box - export is power-user enhancement, not requirement

**What to Avoid:**
- **SAP's complexity tax** → Every feature must justify its cognitive load - if it adds confusion, it must provide proportional value or be eliminated
- **SAP's cryptic language** → Plain language appropriate for manufacturing context ("Create RCA" not "Initiate Analysis Transaction," "Pending Approval" not "Status: APPR_PEND")
- **Teams' chat chaos** → Structured collaboration around RCA workflow with clear purposes (brainstorming, solutions, comments), not free-form chat that becomes unsearchable noise
- **Excel's blank slate problem** → Pre-built dashboards that provide immediate value on day one, with export as optional power-user enhancement, not baseline requirement

**Strategic Positioning:**

fixapp positions itself as **"the modern alternative to SAP's RCA modules"** - maintaining enterprise rigor while delivering consumer-grade usability. For users familiar with Office 365, fixapp should feel like **"Outlook + Teams for manufacturing RCA"** - action-oriented, collaborative, and integrated into their existing ecosystem. The experience should feel like a natural extension of tools they already trust, not another complex enterprise system to master.

## Design System Foundation

### Design System Choice

**Shadcn/ui + Radix UI + Tailwind CSS**

fixapp will use a modern, component-driven design system built on Shadcn/ui (component library), Radix UI (accessible primitives), and Tailwind CSS (utility-first styling). This approach provides production-ready components with complete customization freedom, enabling rapid development while maintaining full control over visual identity and behavior.

### Rationale for Selection

**Speed without compromise:** Shadcn/ui provides 50+ pre-built, production-ready components that can be copied directly into the codebase and modified as needed. Unlike traditional component libraries, this "copy-paste" approach eliminates vendor lock-in and theme override complexity, enabling the high-expertise development team to move fast while maintaining complete control.

**Modern technology stack:** Built on cutting-edge foundations (Radix UI for accessibility, Tailwind for styling), this stack represents current best practices for 2024/2025 SaaS development. No runtime CSS-in-JS overhead ensures optimal performance across desktop, tablet, and mobile devices - critical for fixapp's <2 second page load requirement.

**Visual differentiation from Office 365:** Unlike established design systems (Material, Fluent) that carry strong brand associations, Shadcn/ui provides unopinionated components that can be styled to create a distinct visual identity. fixapp will feel modern and professional without resembling Google or Microsoft products.

**True component ownership:** Components live in fixapp's codebase, not in node_modules. This enables unlimited customization for unique requirements (fishbone diagrams, RCA workflow visualizations, plant floor mobile interfaces) without framework limitations or upgrade conflicts.

**Enterprise-grade accessibility:** Radix UI primitives provide WCAG AA accessibility compliance out of the box, including keyboard navigation, screen reader support, focus management, and ARIA attributes. This meets fixapp's enterprise security and compliance requirements without additional development overhead.

**High-expertise team optimization:** The development team's high skill level can fully leverage Shadcn/ui's flexibility. Rather than working around framework constraints, they can directly modify components to meet fixapp's specific needs (touch-first mobile interfaces, data-dense dashboards, real-time collaboration features).

### Implementation Approach

**Foundation setup:**
1. Initialize Shadcn/ui with Tailwind CSS configuration
2. Define fixapp design tokens (colors, typography, spacing, shadows) in Tailwind config
3. Establish component structure and naming conventions
4. Set up development environment with TypeScript for type safety

**Component strategy:**
- **Use Shadcn/ui components for:** Forms, buttons, dialogs, dropdowns, tabs, cards, data tables, input fields, date pickers, select menus, alerts, badges, navigation
- **Build custom components for:** Fishbone diagram editor, RCA status timeline visualization, action-oriented dashboard cards, team member assignment interface, AI suggestion panels, mobile-optimized plant floor UI
- **Leverage Radix UI primitives directly for:** Complex interactions like multi-step workflows, contextual menus, tooltip systems, accordion patterns

**Responsive design implementation:**
- Tailwind's mobile-first utilities for responsive breakpoints
- Touch-first component variants for plant floor tablet/mobile usage
- Desktop-optimized layouts for analysis and reporting workflows
- Progressive enhancement for offline/low-connectivity scenarios

**Performance optimization:**
- Tailwind's JIT (Just-In-Time) compilation for minimal CSS bundle size
- Tree-shaking to eliminate unused components
- Code splitting for faster initial page loads
- Lazy loading for heavy components (fishbone editor, data visualizations)

### Customization Strategy

**Brand identity development:**
- Custom color palette distinct from Material (blue/teal) and Office 365 (blue/gray) - likely warm neutrals with action accent colors
- Typography scale optimized for:
  - Data-dense desktop dashboards (readability at smaller sizes)
  - Plant floor mobile interfaces (legibility in bright manufacturing environments)
  - Professional reporting outputs (PDF exports, presentations)
- Spacing system balancing information density (desktop) with touch targets (mobile)

**Component customization priorities:**
1. **Action-oriented dashboard cards:** Shadcn/ui card components customized to highlight "what needs attention" with visual hierarchy, status indicators, and one-tap actions
2. **RCA workflow forms:** Form components with smart defaults, progressive disclosure, pre-validation, and auto-save to achieve <2 minute RCA creation goal
3. **Mobile-first interactions:** Button sizes, touch targets, gesture support optimized for gloved hands and plant floor conditions
4. **Data visualization:** Custom components for fishbone diagrams, timeline views, pattern detection displays built on Radix primitives

**Accessibility customization:**
- High contrast mode for bright manufacturing floor environments
- Keyboard shortcuts for power users (engineers doing analysis)
- Screen reader optimization for compliance and inclusivity
- Focus indicators visible on complex interactive components

**Integration points:**
- Tailwind utilities for Office 365 SSO authentication flows (familiar visual patterns without copying brand)
- Consistent visual language across web, mobile web, and future native apps
- Design token export for PDF report generation (matching in-app and exported visuals)

**Custom component development:**
- **Fishbone diagram editor:** Interactive canvas built on Radix primitives with drag-drop, text editing, category management
- **RCA status badges:** Custom visual language for workflow states (Brainstorming/Analysis/Solutions/Approved) with color, icons, animations
- **AI suggestion panels:** Contextual display of AI recommendations with transparency indicators, acceptance/rejection controls, learning feedback
- **Team collaboration interfaces:** @mention autocomplete, threaded comments, real-time presence indicators adapted from Shadcn/ui primitives

## Defining User Experience

### Defining Experience

**"From seeing what needs my attention to taking action on it - instantly"**

fixapp's defining experience is the zero-friction transition from awareness to action. This core interaction manifests across all user roles but follows the same fundamental mechanic: users open the application and immediately see what requires their attention, then act on it without navigation, searching, or context switching.

**Role-specific manifestations:**

- **Plant Operator Priya:** Sees "High-impact ticket → Create RCA now?" → Taps button → Pre-filled form appears → 90 seconds later, submission complete
- **RCA Owner Rajesh:** Opens app → "3 pending approvals" displayed prominently → Taps first approval → Reviews inline → Approves with one tap → Next approval auto-appears
- **Engineer Anika:** Receives notification "Action due today" → Taps notification → Deep-linked directly to action → Marks complete → Attaches photo evidence → Done
- **Country Leader Sanduni:** Dashboard shows "1 bottleneck at Puttalam - stuck 8 days" → Taps alert → Adds mentor to unstuck RCA → Problem addressed

The magic lies in **eliminating the gap between knowing and doing**. Traditional RCA systems require users to navigate, search, remember, and piece together context before they can act. fixapp delivers action-ready information that requires only execution, not discovery.

### User Mental Model

**Current problem-solving approach (SAP + spreadsheets):**

Users currently navigate complex enterprise systems that treat RCA management as data entry rather than workflow completion. The typical flow involves: open SAP → navigate through hierarchical menus → locate correct transaction code → manually enter data across 20+ form fields → submit and hope it routes to the right person → check emails/Teams for scattered updates → wait for analyst to manually consolidate Excel files from multiple plants.

**Mental models users bring to fixapp:**

- **"Enterprise software is inherently slow and complex"** - fixapp subverts this expectation by delivering consumer-grade speed and simplicity in enterprise context
- **"I need to search and navigate to find relevant information"** - fixapp inverts this model by pushing relevant items directly to users based on role and context
- **"Forms require dozens of required fields to be complete"** - fixapp challenges this assumption by showing only essential fields and using smart defaults for everything else
- **"Approvals require reviewing full documentation"** - fixapp provides inline context and one-tap actions for routine decisions

**Potential confusion points requiring design attention:**

- **Simplicity skepticism:** "Where are all the fields?" - Users accustomed to SAP's complexity may question if fixapp captures enough information. Design solution: Progressive disclosure reveals advanced fields when needed, with "Show more options" available.
- **Smart default accuracy:** Equipment autocomplete or auto-assignment suggestions must achieve 80%+ accuracy or users lose trust and revert to manual selection. Failed predictions are worse than no predictions.
- **Historical data access:** Action-first dashboard prioritizes immediate work over browsing past RCAs. Design solution: Clear "View All RCAs" navigation and powerful search prevent users from feeling information is hidden.

### Success Criteria

**"This just works" indicators:**

- RCA creation completes in <2 minutes consistently for 90%+ of operator submissions
- Approvals require 3 taps or fewer from dashboard to completion
- Dashboard always displays relevant actions - never empty (nothing to do) or overwhelming (50+ items without prioritization)
- AI suggestions appear contextually during analysis phase with 60%+ perceived relevance
- Zero navigation required for primary workflows (create, approve, update, monitor)

**User accomplishment moments:**

- **Smart context recognition:** Pre-filled forms demonstrate system "knows" user's location, recent equipment, and typical workflows
- **Visible progress:** Action counts decrease in real-time as users work through queue ("3 pending" → "2 pending" → "1 pending" → "All caught up!")
- **Impact visibility:** Contribution metrics show individual work helped broader organization ("Your solution prevented 2 shutdowns this week" or "This solution helped 3 other plants")
- **Professional outputs:** One-tap PDF generation produces presentation-ready reports that impress management

**Performance expectations:**

- **Page transitions:** <500ms (feels instant, maintains flow state)
- **Search/autocomplete:** <200ms response time (typing feels fluid and responsive)
- **Form submission:** <1 second to confirmation (builds confidence in system reliability)
- **Dashboard refresh:** <2 seconds total load (within user attention span, no context loss)

**Automatic system behaviors:**

- Draft auto-save every 10 seconds prevents data loss during connectivity interruptions
- Status transitions occur automatically (RCA moves from "Brainstorming" to "Analysis" when fishbone diagram created)
- Notifications route to relevant people when assigned, @mentioned, or responsible for next action
- Team member suggestions appear based on equipment type, fault patterns, and historical participation
- Bottleneck detection flags RCAs stuck in single phase beyond threshold (8+ days)

### Novel UX Patterns

fixapp **combines familiar patterns in innovative ways** rather than introducing novel interactions requiring user education.

**Established patterns adopted from proven products:**

- **Outlook's focused inbox model** → Action-first dashboard separating "needs attention now" from "everything else"
- **Tinder's swipe-to-act mechanic** → One-tap approvals with immediate visual feedback and auto-progression to next item
- **GitHub's notification-to-context flow** → Deep linking from push notifications directly to specific RCA or action (not generic homepage)
- **Google's smart compose intelligence** → Autocomplete and pre-filled forms that predict user intent based on context

**fixapp's unique innovation twist:**

- **Context-aware progressive disclosure:** Form complexity adapts dynamically to user role and situation. Operators creating routine RCAs see 5 essential fields with smart defaults. Global Admins accessing advanced features see expanded options. Same form, different complexity based on need.

- **Action velocity optimization:** Every interaction designed for minimum taps/clicks from awareness to completion. Approval in 1 tap (not 5), status update in 1 tap (not navigation → form → submit), RCA creation in 90 seconds (not 15 minutes).

- **Hierarchical intelligence without filtering:** Dashboard content changes automatically based on user scope (plant → country → global) without explicit filter selection. Country leaders see their region naturally, not because they selected "Sri Lanka" from a dropdown.

**No novel patterns requiring user education:** fixapp innovates through intelligent combination and optimization of proven patterns, not by inventing new interaction paradigms that demand learning curves.

### Experience Mechanics

**1. Initiation: How the experience begins**

**Dashboard as action hub (primary entry point):**

User opens fixapp via web browser or mobile device. No splash screen, no loading states - immediate display of action-first dashboard customized to role:

- **Operators:** "2 maintenance tickets need RCA" displayed as action cards + recent RCA submissions for reference
- **RCA Owners:** "3 pending approvals • 2 overdue actions" with expandable preview cards showing key context
- **Engineers:** "2 actions due this week" with status indicators and due date urgency
- **Country Leaders:** "1 bottleneck flagged • 4 plants under target" with drill-down to plant details
- **Global Admins:** "15 overdue actions across 3 countries • Pattern detected: 3 VRM failures" with cross-location insights

**Notification as direct entry (secondary entry point):**

Push notification delivers specific context: "RCA-2847 assigned to you - VRM Line 3 failure - High impact"

Tapping notification deep-links directly to that specific RCA (not homepage, not dashboard navigation - straight to the actionable item). Context is pre-loaded and ready for immediate action.

**2. Interaction: What users actually do**

**Operators creating RCA from maintenance ticket:**

- Tap "Create RCA from Ticket" on high-impact maintenance alert
- Form appears **80% pre-filled:** Equipment name (from ticket), Location (from user profile), Impact level (from ticket analysis), Timestamp (automatic)
- **5 visible fields maximum:** Issue description (2-3 sentences), Photo attachment (one-tap camera access), Verification checkbox
- **Smart autocomplete:** Equipment name suggests matches after 2 characters typed
- Tap "Submit RCA" - no confirmation dialog unless validation error detected
- **90-second total workflow** from initiation to completion

**RCA Owners approving completed solutions:**

- Dashboard displays action card: "Anika completed: Install voltage monitoring system - Due: Dec 28"
- **Card shows inline actions:** [Approve] [Request Changes] buttons visible without expansion
- Tap [Approve] → Micro-animation (subtle checkmark fade-in) → Card updates to "Approved" status → Next pending card auto-focuses
- **No page navigation required** - entire approval workflow happens within dashboard context
- **3 taps maximum:** Open app → Tap approve → Tap next (or automatic progression)

**Engineers updating action status:**

- Notification tapped → Deep-linked directly to action detail screen
- **One-tap primary action:** "Mark Complete" button prominently displayed
- **Optional context additions:** Photo attachment (camera one-tap), Comment field (if explanation needed), Evidence upload
- Tap "Mark Complete" → Confirmation animation → Return to action list with updated count
- **Impact shown immediately:** "Your solution prevented 2 more shutdowns this week"

**3. Feedback: How users know it's working**

**Immediate visual confirmation:**

- **Success animations:** Subtle checkmark fade-in (professional, not playful - respecting serious work context)
- **Status badge transitions:** "Pending" → "Approved" with smooth color transition (amber → green)
- **Count updates in real-time:** "3 pending approvals" → "2 pending approvals" updates instantly on dashboard
- **Toast notifications:** "RCA-2847 created and assigned to Rajesh Mehta" (2-second display, user-dismissible, non-blocking)

**Progress indicators during operations:**

- **During form submission:** Inline spinner on button text changes to "Creating..." (never full-page blocking loader)
- **Photo upload:** Thumbnail preview appears with circular progress ring showing upload percentage
- **Auto-save drafts:** Subtle text below form "Draft saved 2 seconds ago" provides confidence without interruption

**Error handling and recovery:**

- **Inline validation errors:** Red border on problematic field + specific message below ("Issue description required - minimum 10 characters")
- **Network connectivity errors:** "Couldn't submit - check your connection. Draft saved automatically and will retry when online."
- **Conflict resolution:** "This RCA was updated by Rajesh 30 seconds ago. [View their changes] [Override with my version]"
- **Guided recovery:** Error messages always include actionable next step, never just "Error occurred"

**4. Completion: How users know they're done**

**Clear completion states with next action guidance:**

- **Operators after RCA creation:** "RCA-2847 created successfully" + **Immediate next options:** "Create another RCA" or "View my submissions"
- **RCA Owners after approval:** Approved card slides away with animation → Next pending item auto-appears OR "All caught up! ✓ No pending approvals"
- **Engineers after action completion:** "Action completed - pending approval" → **Impact metric shown:** "This solution helped 3 other plants solve similar issues"
- **Leaders after resolving bottleneck:** Bottleneck badge disappears from dashboard + subtle celebration animation + confirmation "Mentor assigned to Puttalam RCA-P1847"

**Contextual "what's next" guidance:**

- **After creating RCA:** "Rajesh Mehta will be notified and can begin investigation" + "Track progress in My RCAs tab"
- **After final approval:** "Next pending approval" auto-loads OR "Export this week's completed RCAs to Excel for reporting"
- **After completing all actions:** "2 more actions due this week - next due Dec 30" OR "You're all clear! Great work."
- **After addressing bottleneck:** "Puttalam RCA now in Analysis phase - Rajesh assigned as mentor"

**System continuity:**

No dead ends - every completion state provides clear next action or confirms user is done. Users always know where they stand and what (if anything) requires attention next.

## Visual Design Foundation

### Color System

**Primary Color Palette: Neutral + Green**

fixapp uses a neutral gray foundation with vibrant green accents to create a fresh, optimistic aesthetic that signals growth, success, and positive action. This palette differentiates fixapp from both Office 365 (blue) and Material Design (teal) while maintaining professional credibility for enterprise manufacturing contexts.

**Core Colors:**

- **Primary (Neutral Dark):** `#18181B` - Primary text, headings, high-emphasis content
- **Accent (Emerald Green):** `#10B981` - Primary actions, success states, calls-to-action, growth indicators
- **Success (Dark Green):** `#059669` - Completed actions, approved status, positive outcomes
- **Error (Red):** `#EF4444` - Validation errors, overdue items, critical alerts
- **Warning (Amber):** `#F59E0B` - Pending actions, attention needed, moderate urgency
- **Background (Near White):** `#FAFAFA` - Page backgrounds, application canvas
- **Surface (White):** `#FFFFFF` - Card backgrounds, form surfaces, elevated content
- **Muted (Gray):** `#71717A` - Secondary text, metadata, de-emphasized content
- **Border (Light Gray):** `#E4E4E7` - Dividers, card borders, form input borders

**Semantic Color Mappings:**

- **Primary actions:** Green (`#10B981`) - "Approve," "Submit RCA," "Mark Complete"
- **Secondary actions:** Neutral (`#18181B`) - "View Details," "Cancel," "Back"
- **Destructive actions:** Red (`#EF4444`) - "Delete," "Reject," "Remove"
- **Status badges:**
  - Approved: Green background (`#D1FAE5`) with dark green text (`#065F46`)
  - Pending: Amber background (`#FEF3C7`) with dark amber text (`#92400E`)
  - In Progress: Blue background (`#DBEAFE`) with dark blue text (`#1E3A8A`)
  - Analysis: Neutral background (`#F4F4F5`) with dark text (`#52525B`)

**Accessibility Compliance:**

All color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text):
- Primary text on white: `#18181B` on `#FFFFFF` - 16.8:1 ratio
- Green buttons: `#FFFFFF` on `#10B981` - 4.7:1 ratio
- Muted text on white: `#71717A` on `#FFFFFF` - 4.6:1 ratio

High contrast mode available for bright manufacturing floor environments increases all contrast ratios by 20%.

**Color Psychology Rationale:**

Green accent signals positive progress and problem-solving success - when engineers complete actions and see green confirmations, it reinforces accomplishment. Neutral grays create calm, focused work environment without visual noise. This palette feels optimistic and forward-looking (growth, improvement) rather than punitive or compliance-focused.

### Typography System

**Primary Typeface: Inter (or system font stack)**

Inter is a modern, highly readable sans-serif optimized for digital interfaces. It performs excellently at both small sizes (data tables, metadata) and large sizes (headings, stat values). Open-source, free, and widely supported across platforms.

**System Font Stack Fallback:**
```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

Benefits: Zero loading time, native OS feel, excellent cross-platform rendering.

**Monospace Typeface: JetBrains Mono (Optional)**

Used for technical content requiring fixed-width characters:
- RCA identifiers: `RCA-2847`, `RCA-V2103`
- Timestamps: `2025-12-22 14:30`
- System codes and technical references

**Type Scale:**

- **Display (32px / 2rem):** Dashboard stat values ("3 pending approvals"), section headers on desktop
- **H1 (24px / 1.5rem):** Page titles, major section headers
- **H2 (20px / 1.25rem):** Card headers, subsection titles
- **H3 (16px / 1rem):** Form labels, list section headers, emphasis headings
- **Body (14px / 0.875rem):** Default paragraph text, form inputs, list items, table content
- **Small (12px / 0.75rem):** Captions, metadata, timestamps, helper text
- **Tiny (11px / 0.6875rem):** Data table compact mode, fine print

**Mobile/Plant Floor Adjustments:**

Touch-first contexts increase font sizes by 2px (14.3%) for improved legibility in bright environments and while wearing safety equipment:
- Body: 14px → 16px
- Small: 12px → 14px
- Buttons: 14px → 16px

**Line Heights:**

- **Headings:** 1.2 (tight, minimal space)
- **Body text:** 1.5 (comfortable reading)
- **Form labels:** 1.4 (balanced spacing)
- **Data tables:** 1.3 (compact, information-dense)

**Font Weights:**

- **Regular (400):** Body text, form inputs, general content
- **Medium (500):** Form labels, table headers, subtle emphasis
- **Semibold (600):** Buttons, card titles, section headers
- **Bold (700):** H1, H2, stat values, high emphasis

**Typography Hierarchy Principles:**

1. **Action-first hierarchy:** Buttons and calls-to-action use larger text (14-16px) with semibold weight to signal interactivity
2. **Data clarity:** Monospace for system-generated identifiers creates visual distinction from user content
3. **Scanning optimization:** Headings use tight line-height (1.2) to group related content, body uses comfortable line-height (1.5) for readability
4. **Context adaptation:** Font sizes increase in mobile/plant floor contexts for accessibility with gloves and bright lighting

### Spacing & Layout Foundation

**Base Spacing Unit: 4px**

Tailwind CSS spacing scale provides consistent rhythm across all components:
- **1 unit:** 4px (fine adjustments, tight spacing)
- **2 units:** 8px (compact element spacing)
- **3 units:** 12px (default gap between related elements)
- **4 units:** 16px (comfortable spacing, paragraph margins)
- **5 units:** 20px (section padding, card internal spacing)
- **6 units:** 24px (generous spacing, major section gaps)
- **8 units:** 32px (large section breaks)
- **10 units:** 40px (page-level spacing)
- **12 units:** 48px (hero sections)
- **16 units:** 64px (major layout divisions)

**Responsive Grid System:**

12-column flexible grid adapts to context:

**Desktop (1024px and above):**
- 3-4 column dashboard layouts for stat cards and action items
- Multi-panel views (sidebar + main content + detail panel)
- Dense information display optimized for large screens
- Gap between columns: 24px (6 units)

**Tablet (768px - 1023px):**
- 2 column layouts for plant floor tablet usage
- Touch-optimized spacing with 44px minimum tap targets
- Simplified navigation (collapsible sidebar)
- Gap between columns: 20px (5 units)

**Mobile (below 768px):**
- Single column, full-width cards
- Stacked vertical layout with clear visual hierarchy
- Generous spacing for touch interactions
- Gap between elements: 16px (4 units)

**Layout Density Adaptation:**

**Desktop Dashboards (Information Dense):**
- Card padding: 20px (5 units)
- Gap between cards: 12-16px (3-4 units)
- Users prioritize seeing more information over white space
- Efficient use of screen real estate for data-heavy interfaces

**Mobile Plant Floor (Touch Optimized):**
- Card padding: 24px (6 units)
- Gap between cards: 20-24px (5-6 units)
- Minimum button height: 44px (11 units) for gloved hands
- Generous spacing prevents accidental taps

**Touch Target Specifications:**

- **Minimum interactive element height:** 44px (WCAG AAA standard)
- **Minimum interactive element width:** 44px
- **Spacing between adjacent interactive elements:** 8px minimum
- **Primary action buttons (mobile):** 48-56px height for prominence and ease of use

**White Space Philosophy:**

- **Functional density:** Desktop interfaces use compact spacing to maximize information visibility without overwhelming users
- **Breathing room:** Generous padding within cards (20-24px) creates clear content boundaries even with tight card spacing
- **Visual grouping:** Consistent spacing relationships establish hierarchy (related items closer together, unrelated items farther apart)
- **Scan optimization:** Section breaks use 32-48px gaps to create clear mental models of content organization

**Component Spacing Patterns:**

**Dashboard Cards:**
- Internal padding: 20px
- Gap between cards: 16px (desktop), 20px (mobile)
- Header-to-content spacing: 12px

**Forms:**
- Label-to-input spacing: 8px
- Input-to-input spacing: 16px
- Form section spacing: 24px
- Submit button top margin: 24px

**Data Tables:**
- Row height: 40px (desktop), 48px (mobile)
- Cell padding: 12px horizontal, 8px vertical
- Header bottom border spacing: 8px

**Navigation:**
- Menu item height: 40px (desktop), 48px (mobile)
- Menu item padding: 12px horizontal
- Submenu indent: 16px

### Accessibility Considerations

**Color Accessibility:**

- **WCAG AA compliance:** All text-on-background combinations meet 4.5:1 contrast ratio (normal text) or 3:1 (large text 18px+)
- **Color blindness considerations:** Never use color alone to convey information - always pair with text labels, icons, or patterns
- **High contrast mode:** Optional mode increases all contrast ratios by 20% for bright manufacturing environments
- **Status indicators:** Use both color and text/icons (e.g., "Approved" badge is green background + checkmark icon + "Approved" text)

**Typography Accessibility:**

- **Minimum font size:** 12px (0.75rem) for supporting text, 14px (0.875rem) for body content
- **Line height minimum:** 1.5 for body text ensures readability for users with dyslexia or visual processing challenges
- **Font weight contrast:** Minimum 200-weight difference between body and headings (400 regular vs. 600 semibold) creates clear hierarchy
- **Scalability:** All text sizes defined in rem units allow user browser zoom without breaking layouts

**Touch Accessibility:**

- **Minimum touch target:** 44x44px meets WCAG AAA standard for motor control accessibility
- **Touch target spacing:** 8px minimum between interactive elements prevents accidental activation
- **Hit area expansion:** Touch targets visually smaller can have expanded invisible hit areas (e.g., 32px button with 44px tap area)

**Focus States:**

- **Keyboard navigation:** All interactive elements have visible focus indicators (2px green outline with 2px offset)
- **Focus order:** Logical tab order follows visual layout (top-to-bottom, left-to-right)
- **Skip links:** "Skip to main content" link for keyboard users to bypass navigation

**Screen Reader Optimization:**

- **Semantic HTML:** Proper heading hierarchy (h1 → h2 → h3) enables screen reader navigation
- **ARIA labels:** Interactive elements have descriptive labels ("Approve RCA-2847" not just "Approve")
- **Status announcements:** Dynamic content changes announced to screen readers (e.g., "RCA created successfully")
- **Form field associations:** Labels properly associated with inputs via for/id attributes

**Motion Accessibility:**

- **Reduced motion preference:** Respect prefers-reduced-motion media query
- **Animation duration:** Brief transitions (200-300ms) minimize motion sickness
- **Optional animations:** Success checkmarks and transitions can be disabled in settings

**Plant Floor Specific Accessibility:**

- **High visibility mode:** Increased contrast for bright sunlight environments
- **Glove-friendly interactions:** Oversized touch targets (48-56px) for safety glove usage
- **Simplified gestures:** No complex multi-finger gestures required (swipe, pinch)
- **Audible feedback option:** Sound effects for successful actions in noisy environments (optional)
