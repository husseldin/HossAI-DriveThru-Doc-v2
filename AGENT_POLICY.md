# 🤖 AI Agent Policy & Guidelines

## 🎯 Purpose

This document defines the mandatory policies, rules, and guidelines that ALL AI agents working on the HossAI Drive-Thru project MUST follow without exception.

---

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### 1. Port Configuration Policy

**RULE**: All network ports MUST use the 46xxx range

| Service | Port | Status | Change Allowed |
|---------|------|--------|----------------|
| Backend API | **46000** | FIXED | ❌ NO |
| Control Panel UI | **46001** | FIXED | ❌ NO |
| Demo UI | **46002** | FIXED | ❌ NO |
| PostgreSQL | **46432** | FIXED | ❌ NO |
| Redis | **46379** | FIXED | ❌ NO |

**Violation Consequences**:
- ❌ Immediate rollback required
- ❌ Must update execution log with violation
- ❌ Must correct all affected files
- ❌ Must re-run all tests

**Exception Process**:
- Only user can authorize port changes
- Must be explicitly requested
- Must update this policy document
- Must update all documentation

---

### 2. Folder Structure Policy

**RULE**: The following folder structure is IMMUTABLE

```
HossAI-DriveThru-Doc-v2/
├── docs/                    ← DO NOT RENAME/MOVE
│   ├── architecture/
│   ├── guides/
│   ├── api/
│   ├── testing/
│   └── deployment/
├── src/                     ← DO NOT RENAME/MOVE
│   ├── api/
│   ├── models/
│   ├── services/
│   └── tests/
├── control-panel/           ← DO NOT RENAME/MOVE
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── __tests__/
├── demo-ui/                 ← DO NOT RENAME/MOVE
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── __tests__/
├── e2e/                     ← DO NOT RENAME/MOVE
├── logs/                    ← DO NOT RENAME/MOVE
├── AGENT_INSTRUCTIONS.md    ← DO NOT RENAME/MOVE
├── AGENT_POLICY.md          ← DO NOT RENAME/MOVE
└── README.md                ← DO NOT RENAME/MOVE
```

**What You CAN Do**:
- ✅ Add new files within existing folders
- ✅ Add new subfolders within appropriate sections
- ✅ Edit existing files (with caution)

**What You CANNOT Do**:
- ❌ Rename any top-level folders
- ❌ Move folders to different locations
- ❌ Delete folders without explicit permission
- ❌ Change folder nesting structure

---

### 3. Documentation Update Policy

**RULE**: Documentation MUST be updated with EVERY change

#### Mandatory Updates After Each Step:

1. **Execution Log** (`logs/execution-log.md`)
   - Update step status
   - Record timestamp
   - Document actions taken
   - List tests run
   - Note any issues

2. **Relevant Documentation**
   - Update README.md if ports/structure changes
   - Update docs/ files if functionality changes
   - Update configuration guides if configs change

3. **Commit Messages**
   - Must reference documentation updates
   - Must mention tests run
   - Must note compliance with policies

#### Documentation Standards:

- **Accuracy**: 100% - No outdated information allowed
- **Completeness**: All sections must be filled
- **Timeliness**: Update immediately after change
- **Clarity**: Use clear, unambiguous language

---

### 4. Testing Policy

**RULE**: All tests MUST pass before proceeding to next step

#### Test Requirements by Phase:

| Phase | Component | Min Tests | Coverage | Blocking |
|-------|-----------|-----------|----------|----------|
| 2 | Backend | 250+ | 80%+ | ✅ YES |
| 3 | Control Panel | 5+ | 70%+ | ✅ YES |
| 4 | Demo UI | 130+ | 75%+ | ✅ YES |
| 5 | E2E | 20+ | 100% | ✅ YES |

#### Test Execution Rules:

1. **Before Marking Step Complete**:
   - ✅ Run all relevant tests
   - ✅ Verify 100% pass rate
   - ✅ Generate coverage report
   - ✅ Document results in execution log

2. **If Tests Fail**:
   - ❌ DO NOT proceed to next step
   - ❌ DO NOT mark step as complete
   - 🔧 Fix failing tests first
   - 📝 Document issue and resolution
   - ♻️ Re-run tests until 100% pass

3. **Test Types Required**:
   - Unit tests
   - Integration tests
   - Component tests (frontend)
   - E2E tests (full system)

---

### 5. Git Commit Policy

**RULE**: All changes MUST be committed with proper messages

#### Commit Message Format:

```
[Phase X.Y] Brief Description

- Change 1
- Change 2
- Change 3

Tests: [PASS/FAIL] - X/Y passing
Docs: [UPDATED/NOT_NEEDED]
Compliance: [PORTS_OK] [STRUCTURE_OK] [TESTS_OK]

Refs: Step X.Y in execution log
```

#### Example:
```
[Phase 2.2] Configure Backend for Port 46000

- Updated src/main.py to use port 46000
- Created .env with correct port configuration
- Updated database connection to port 46432
- Updated Redis connection to port 46379

Tests: PASS - 250/250 passing
Docs: UPDATED - README.md, execution log
Compliance: PORTS_OK STRUCTURE_OK TESTS_OK

Refs: Step 2.2 in logs/execution-log.md
```

---

### 6. Error Handling Policy

**RULE**: All errors MUST be documented and resolved before proceeding

#### When Error Occurs:

1. **Stop Current Step**
   - Do not proceed further
   - Mark step status as FAILED in log

2. **Document Error**
   - Error message
   - Stack trace (if applicable)
   - Steps to reproduce
   - Current system state

3. **Investigate**
   - Check logs
   - Verify configuration
   - Review recent changes
   - Consult troubleshooting guide

4. **Resolve**
   - Apply fix
   - Test fix
   - Document resolution
   - Update troubleshooting guide if new issue

5. **Verify**
   - Re-run failed operation
   - Run all tests
   - Update execution log
   - Mark step as COMPLETED

---

### 7. Configuration Management Policy

**RULE**: All configuration changes MUST be tracked and documented

#### Configuration Files:

| File | Contains | Change Frequency | Review Required |
|------|----------|------------------|-----------------|
| `.env` | Backend config | Setup only | ✅ YES |
| `control-panel/.env.local` | Control Panel config | Setup only | ✅ YES |
| `demo-ui/.env.local` | Demo UI config | Setup only | ✅ YES |
| `src/config.py` | Backend settings | Rare | ✅ YES |
| `playwright.config.ts` | E2E config | Setup only | ✅ YES |

#### Configuration Change Process:

1. **Before Change**:
   - Document current values
   - Understand impact
   - Check dependencies

2. **During Change**:
   - Update configuration file
   - Update related files
   - Maintain consistency

3. **After Change**:
   - Test configuration
   - Update documentation
   - Commit changes
   - Update execution log

---

### 8. Backup Policy

**RULE**: Create backups before major changes

#### Backup Points:

- Before Phase 2 (Backend setup)
- Before Phase 3 (Control Panel setup)
- Before Phase 4 (Demo UI setup)
- Before Phase 6 (Port changes)
- Before any database operations

#### Backup Commands:

```bash
# Git commit current state
git add -A
git commit -m "[BACKUP] Before Phase X"
git tag backup-phase-X

# Database backup (if populated)
pg_dump -p 46432 drivethru_db > backups/db-$(date +%Y%m%d).sql
```

---

### 9. Verification Policy

**RULE**: Every completed step MUST be verified

#### Verification Checklist:

- [ ] Primary objective achieved
- [ ] All tests passing
- [ ] No errors in logs
- [ ] Configuration correct
- [ ] Ports correct (46xxx)
- [ ] Structure unchanged
- [ ] Documentation updated
- [ ] Execution log updated
- [ ] Git committed

#### Verification Process:

1. **Self-Verification**:
   - Agent checks own work
   - Runs verification commands
   - Reviews checklist

2. **Automated Verification**:
   - Test suite runs
   - Coverage checks
   - Linting passes

3. **Manual Verification**:
   - Service starts successfully
   - UI loads correctly
   - API responds properly

---

### 10. Communication Policy

**RULE**: All significant actions MUST be logged

#### What to Log:

- ✅ Step start/completion
- ✅ Configuration changes
- ✅ Test results
- ✅ Errors encountered
- ✅ Resolutions applied
- ✅ Verification results
- ✅ Time spent on each step

#### Where to Log:

- `logs/execution-log.md` - Primary log
- Git commit messages - Change history
- Documentation - Permanent reference

#### Log Format:

```markdown
## [YYYY-MM-DD HH:MM:SS] Step X.Y: [Action]
**Status**: [STATUS]
**Duration**: [time]

### Actions
- Action 1
- Action 2

### Results
- Result 1
- Result 2

### Issues
- Issue (if any)

### Next
Step X.Y+1
```

---

## 📋 Step-by-Step Compliance Checklist

Use this checklist for EVERY step:

### Before Starting Step:
- [ ] Read step instructions completely
- [ ] Understand requirements
- [ ] Check prerequisites met
- [ ] Review related documentation

### During Step:
- [ ] Follow instructions exactly
- [ ] Use correct ports (46xxx)
- [ ] Maintain folder structure
- [ ] Test as you go
- [ ] Document decisions

### After Step:
- [ ] Run all relevant tests
- [ ] Verify tests pass (100%)
- [ ] Update execution log
- [ ] Update documentation
- [ ] Git commit with proper message
- [ ] Verify compliance checklist
- [ ] Mark step complete

---

## 🔍 Compliance Audit

### Regular Checks:

Every 5 steps, verify:

```bash
# Port compliance
grep -r "8000\|3000\|3001\|5432\|6379" . --exclude-dir={node_modules,.next,venv} || echo "✓ Ports OK"

# Structure compliance
ls -la | grep -E "^d.*(docs|src|control-panel|demo-ui|e2e|logs)$" | wc -l
# Should return 6

# Documentation current
git status docs/ logs/execution-log.md
# Should show recent commits

# Tests passing
npm run test:all
# Should show all passing
```

---

## 🚨 Violation Response

### If Policy Violated:

1. **STOP immediately**
2. **Assess damage**
   - What was changed incorrectly?
   - What's the impact?
   - Can it be easily fixed?

3. **Document violation**
   ```markdown
   ## POLICY VIOLATION - [timestamp]
   **Policy**: [policy name]
   **Violation**: [what was done wrong]
   **Impact**: [consequences]
   **Resolution**: [how to fix]
   ```

4. **Restore compliance**
   - Revert changes if needed
   - Apply correct changes
   - Re-test everything
   - Update documentation

5. **Prevent recurrence**
   - Update this policy if needed
   - Add safeguards
   - Improve instructions

---

## 📞 Escalation

### When to Escalate to User:

- Cannot resolve error after 3 attempts
- Policy conflict or ambiguity
- Major structural issue discovered
- Test failure cannot be fixed
- Port conflict cannot be resolved
- Database corruption
- Any uncertainty about compliance

### How to Escalate:

1. Document issue completely
2. List attempted solutions
3. Describe current state
4. Ask specific question
5. Await user guidance

---

## ✅ Success Criteria

Project is successful when:

- ✅ All services run on 46xxx ports
- ✅ All 400+ tests passing
- ✅ No policy violations
- ✅ Documentation 100% accurate
- ✅ Execution log complete
- ✅ Folder structure intact
- ✅ No manual interventions needed
- ✅ System fully functional

---

## 📝 Policy Updates

**Version**: 1.0
**Last Updated**: [initial creation]
**Next Review**: After project completion

### Change Log:
- v1.0: Initial policy creation

---

**Remember**: These policies exist to ensure consistency, quality, and reliability. Following them is not optional - it's mandatory for project success.

**Port Policy**: 46xxx range is SACRED and IMMUTABLE.
**Structure Policy**: Folder organization is FIXED.
**Testing Policy**: All tests MUST pass.
**Documentation Policy**: Update with EVERY change.

**END OF POLICY DOCUMENT**
