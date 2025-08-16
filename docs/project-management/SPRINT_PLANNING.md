# 🏃‍♂️ Sprint Planning - xSendMkt

Este documento organiza nossos sprints de desenvolvimento usando metodologia ágil adaptada para GitHub Projects.

---

## 📋 Sprint Atual: Sprint 1 - Core Improvements
**📅 Período:** 16 Jan - 29 Jan 2025 (2 semanas)  
**🎯 Objetivo:** Melhorar funcionalidades core e corrigir bugs críticos  
**👥 Team:** @xr00tlabx  
**🏷️ Milestone:** v1.1.0  

### 🎖️ Sprint Goals
1. **Otimizar sistema de importação SMTP em massa**
2. **Corrigir vazamentos de memória no envio de emails** 
3. **Implementar validação robusta de domínios**
4. **Melhorar logs e debugging**

### 📊 Sprint Backlog

#### 🔥 High Priority (Must Have)
- [ ] **Issue #001** - Optimize bulk SMTP import performance
  - **Story Points:** 8
  - **Assignee:** @xr00tlabx
  - **Status:** 🚀 In Progress
  - **Description:** Melhorar performance de importação de 1000+ emails

- [ ] **Issue #002** - Fix memory leaks in sequential email sending
  - **Story Points:** 5
  - **Assignee:** @xr00tlabx  
  - **Status:** 📋 Todo
  - **Description:** Corrigir vazamentos de memória durante envio em massa

- [ ] **Issue #003** - Implement robust domain validation
  - **Story Points:** 5
  - **Assignee:** @xr00tlabx
  - **Status:** 📋 Todo
  - **Description:** Validação de domínios antes de teste SMTP

#### 🟡 Medium Priority (Should Have)
- [ ] **Issue #004** - Improve error logging and debugging
  - **Story Points:** 3
  - **Assignee:** @xr00tlabx
  - **Status:** 📋 Todo
  - **Description:** Logs mais detalhados para debugging

- [ ] **Issue #005** - Add SMTP configuration templates
  - **Story Points:** 3
  - **Assignee:** @xr00tlabx
  - **Status:** 📋 Todo
  - **Description:** Templates para provedores comuns

#### 🟢 Low Priority (Could Have)
- [ ] **Issue #006** - UI improvements for SMTP config page
  - **Story Points:** 2
  - **Assignee:** @xr00tlabx
  - **Status:** 📋 Todo
  - **Description:** Melhorias visuais na página de configuração

### 📈 Sprint Metrics
- **Total Story Points:** 26
- **Velocity Target:** 20-25 points
- **Team Capacity:** 80 hours (40h/week × 2 weeks)
- **Completed Points:** 0 / 26

---

## 📅 Sprint 2 - Native Desktop Features
**📅 Período:** 30 Jan - 12 Feb 2025 (2 semanas)  
**🎯 Objetivo:** Implementar recursos nativos do Electron  
**👥 Team:** @xr00tlabx  
**🏷️ Milestone:** v1.1.0  

### 🎖️ Sprint Goals
1. **Implementar menu nativo do Electron**
2. **Sistema de auto-update funcional**
3. **Integração com sistema de arquivos**
4. **Notificações nativas do sistema**

### 📊 Sprint Backlog (Planned)

#### 🔥 High Priority
- [ ] **Issue #010** - Native Electron menu implementation
  - **Story Points:** 8
  - **Epic:** Native Desktop Features
  - **Description:** Menu nativo com shortcuts e ações

- [ ] **Issue #011** - Auto-updater system setup
  - **Story Points:** 8
  - **Epic:** Native Desktop Features
  - **Description:** Sistema de atualizações automáticas

#### 🟡 Medium Priority
- [ ] **Issue #012** - File system integration
  - **Story Points:** 5
  - **Epic:** Native Desktop Features
  - **Description:** Salvar/carregar campanhas localmente

- [ ] **Issue #013** - Native system notifications
  - **Story Points:** 3
  - **Epic:** Native Desktop Features
  - **Description:** Notificações do sistema para status

### 📈 Estimated Metrics
- **Total Story Points:** 24
- **Velocity Target:** 20-25 points
- **Team Capacity:** 80 hours

---

## 📅 Sprint 3 - UX Excellence
**📅 Período:** 13 Feb - 26 Feb 2025 (2 semanas)  
**🎯 Objetivo:** Melhorar experiência do usuário  
**👥 Team:** @xr00tlabx  
**🏷️ Milestone:** v1.2.0  

### 🎖️ Sprint Goals (Planned)
1. **System tray integration**
2. **Offline mode capabilities**
3. **Multi-window support**
4. **Performance optimizations**

---

## 🛠️ Sprint Process

### 📋 Sprint Planning Meeting
**Agenda:**
1. Review previous sprint results
2. Define sprint goal
3. Select backlog items
4. Estimate story points
5. Assign tasks to team members
6. Identify dependencies and risks

### 🔄 Daily Standups (Async)
**Format:** GitHub Discussions daily thread
**Questions:**
- What did I complete yesterday?
- What will I work on today?
- Any blockers or impediments?

### 📊 Sprint Review
**Activities:**
- Demo completed features
- Review sprint metrics
- Gather stakeholder feedback
- Update product backlog

### 🔍 Sprint Retrospective
**Focus Areas:**
- What went well?
- What could be improved?
- Action items for next sprint
- Process improvements

---

## 📊 Sprint Tracking

### 🏷️ GitHub Labels for Sprints
```
sprint:current      - Issues in current sprint
sprint:next         - Issues planned for next sprint  
sprint:backlog      - Issues in product backlog
story-points:1      - 1 story point (XS)
story-points:2      - 2 story points (S)
story-points:3      - 3 story points (M)
story-points:5      - 5 story points (L)
story-points:8      - 8 story points (XL)
```

### 📈 Burndown Tracking
**Weekly Updates:**
- Remaining story points
- Completed vs planned work
- Velocity calculations
- Sprint health indicators

### 🎯 Definition of Done
**For all issues:**
- [ ] Code written and reviewed
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No new lint warnings
- [ ] Performance impact assessed

**For features:**
- [ ] User acceptance criteria met
- [ ] UI/UX review completed
- [ ] Accessibility verified
- [ ] Cross-platform testing done

---

## 🔗 GitHub Integration

### Project Board Setup
```
Columns:
📋 Backlog          - Prioritized product backlog
🏃‍♂️ Sprint Backlog   - Current sprint items  
🚀 In Progress      - Being worked on
👀 Review           - Awaiting code review
✅ Done             - Completed this sprint
```

### Automation Rules
- Move to "In Progress" when PR is opened
- Move to "Review" when PR is ready for review
- Move to "Done" when PR is merged
- Auto-assign to sprint based on labels

### Sprint Commands
```bash
# Create new sprint milestone
gh api repos/xr00tlabx/xSendMkt/milestones \
  --method POST \
  --field title='Sprint 1 - Core Improvements' \
  --field due_on='2025-01-29T23:59:59Z'

# Assign issue to sprint
gh issue edit 123 --milestone "Sprint 1 - Core Improvements"

# Add story points label
gh issue edit 123 --add-label "story-points:5"
```

---

## 📈 Sprint Metrics Dashboard

### Key Performance Indicators
- **Velocity:** Story points completed per sprint
- **Burndown:** Work remaining vs time
- **Quality:** Bugs found post-deployment
- **Cycle Time:** Time from start to deployment

### Reporting
- **Weekly:** Sprint progress updates
- **End of Sprint:** Sprint review metrics
- **Monthly:** Velocity trends and team capacity
- **Quarterly:** Product roadmap adjustments

---

## 🎯 Success Criteria

### Sprint Success
- ✅ 90%+ of committed story points completed
- ✅ No critical bugs introduced
- ✅ All acceptance criteria met
- ✅ Documentation updated

### Quality Gates
- ✅ Code coverage > 80%
- ✅ Performance regression < 5%
- ✅ All automated tests pass
- ✅ Security scan clean

### Team Health
- ✅ Sustainable work pace maintained
- ✅ Team satisfaction > 4/5
- ✅ Knowledge sharing happening
- ✅ Continuous improvement initiatives
