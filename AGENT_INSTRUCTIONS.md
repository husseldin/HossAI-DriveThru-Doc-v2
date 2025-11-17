# 🤖 AI Agent Instructions - HossAI Drive-Thru Project

## 📋 Mission Statement

You are an AI agent tasked with building, testing, fixing, and documenting the complete HossAI Drive-Thru Demo Application on a local Mac environment. You must follow this guide meticulously, update documentation at each step, maintain execution logs, and respect all structural constraints.

---

## 🎯 Core Directives

### **ABSOLUTE RULES - NEVER VIOLATE**

1. **Port Structure** - ALL ports MUST be in 46xxx range:
   - Backend API: `46000`
   - Control Panel: `46001`
   - Demo UI: `46002`
   - PostgreSQL: `46432` (custom)
   - Redis: `46379` (custom)
   - **NEVER change these ports without explicit user permission**

2. **Folder Structure** - NEVER modify:
   ```
   HossAI-DriveThru-Doc-v2/
   ├── docs/
   ├── src/
   ├── control-panel/
   ├── demo-ui/
   ├── e2e/
   └── logs/
   ```

3. **Documentation Updates** - MANDATORY after each step:
   - Update execution log
   - Update relevant documentation
   - Mark step as completed with timestamp
   - Document any issues encountered

4. **Testing Requirements** - MANDATORY before marking step complete:
   - Run all relevant tests
   - Verify functionality
   - Document test results
   - Fix any failures before proceeding

---

## 📁 Execution Log System

### Log Location
All logs MUST be maintained in: `logs/execution-log.md`

### Log Format
```markdown
## [YYYY-MM-DD HH:MM:SS] Step X: [Step Name]
**Status**: [IN_PROGRESS | COMPLETED | FAILED | BLOCKED]
**Started**: [timestamp]
**Completed**: [timestamp]
**Duration**: [time taken]

### Actions Taken
- Action 1
- Action 2

### Tests Run
- Test suite: [name] - [PASS/FAIL]
- Coverage: [percentage]

### Issues Encountered
- Issue 1: [description] → [resolution]

### Documentation Updated
- [ ] README.md
- [ ] docs/[specific file]
- [ ] Configuration files
- [ ] Execution log

### Verification
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Ports correct (46xxx)
- [ ] No structural changes

### Next Step
Step X+1: [Next step name]

---
```

---

## 🚀 Implementation Phases

### Phase 1: Environment Setup (Mac)

#### Step 1.1: System Prerequisites
```bash
# Check and install prerequisites
brew --version || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
python3 --version  # Must be 3.10+
node --version     # Must be 18+
npm --version

# Install required tools
brew install postgresql@14
brew install redis
brew install ffmpeg

# Verify installations
psql --version
redis-server --version
ffmpeg -version
```

**Update Log**: Mark Step 1.1 complete with versions

#### Step 1.2: Clone and Setup Repository
```bash
cd ~/Projects  # or your preferred location
git clone [repository-url] HossAI-DriveThru-Doc-v2
cd HossAI-DriveThru-Doc-v2

# Create logs directory
mkdir -p logs

# Initialize execution log
cat > logs/execution-log.md << 'EOF'
# Execution Log - HossAI Drive-Thru Implementation

Started: [date]
Environment: macOS
Agent: Claude

---
EOF
```

**Update Log**: Mark Step 1.2 complete

#### Step 1.3: PostgreSQL Setup (Port 46432)
```bash
# Initialize PostgreSQL
initdb -D /usr/local/var/postgres-drivethru

# Create custom PostgreSQL config
cat > /usr/local/var/postgres-drivethru/postgresql.conf << EOF
port = 46432
max_connections = 100
shared_buffers = 128MB
EOF

# Start PostgreSQL on custom port
pg_ctl -D /usr/local/var/postgres-drivethru -l /usr/local/var/postgres-drivethru/logfile start

# Create database
createdb -p 46432 drivethru_db

# Verify
psql -p 46432 -d drivethru_db -c "SELECT version();"
```

**Update Log**: Mark Step 1.3 complete with PostgreSQL version

#### Step 1.4: Redis Setup (Port 46379)
```bash
# Create Redis config
mkdir -p ~/redis-drivethru
cat > ~/redis-drivethru/redis.conf << EOF
port 46379
bind 127.0.0.1
daemonize yes
pidfile /tmp/redis-drivethru.pid
logfile ~/redis-drivethru/redis.log
dir ~/redis-drivethru
EOF

# Start Redis
redis-server ~/redis-drivethru/redis.conf

# Verify
redis-cli -p 46379 ping
```

**Update Log**: Mark Step 1.4 complete

---

### Phase 2: Backend Setup (Port 46000)

#### Step 2.1: Python Environment
```bash
cd ~/Projects/HossAI-DriveThru-Doc-v2

# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Verify installation
pip list | grep -E "fastapi|sqlalchemy|redis"
```

**Update Log**: Mark Step 2.1 complete with package versions

#### Step 2.2: Backend Configuration
```bash
# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://localhost:46432/drivethru_db
DB_HOST=localhost
DB_PORT=46432
DB_NAME=drivethru_db
DB_USER=your_user
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:46379
REDIS_HOST=localhost
REDIS_PORT=46379

# API
API_HOST=0.0.0.0
API_PORT=46000

# AI Models
STT_MODEL=base
TTS_MODEL=tts_models/multilingual/multi-dataset/xtts_v2
NLU_MODEL=llama-3.1-8b

# Environment
ENVIRONMENT=development
DEBUG=True
EOF
```

**CRITICAL**: Update `src/main.py` port:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=46000, reload=True)
```

**Update Log**: Mark Step 2.2 complete

#### Step 2.3: Database Initialization
```bash
# Run database migrations (if using Alembic)
alembic upgrade head

# Or initialize directly
python -c "from src.database import init_db; init_db()"

# Verify tables
psql -p 46432 -d drivethru_db -c "\dt"
```

**Update Log**: Mark Step 2.3 complete with table count

#### Step 2.4: Backend Tests
```bash
# Run tests
pytest src/tests/ -v --tb=short

# With coverage
pytest src/tests/ --cov=src --cov-report=term --cov-report=html

# Verify coverage
open htmlcov/index.html
```

**MANDATORY**: All tests must pass before proceeding

**Update Log**: Mark Step 2.4 complete with test results

#### Step 2.5: Start Backend
```bash
# Start server
uvicorn src.main:app --host 0.0.0.0 --port 46000 --reload

# In another terminal, verify
curl http://localhost:46000/health
curl http://localhost:46000/docs
```

**Update Log**: Mark Step 2.5 complete with health check result

---

### Phase 3: Control Panel Setup (Port 46001)

#### Step 3.1: Install Dependencies
```bash
cd ~/Projects/HossAI-DriveThru-Doc-v2/control-panel

# Install packages
npm install

# Verify
npm list --depth=0
```

**Update Log**: Mark Step 3.1 complete

#### Step 3.2: Configuration
```bash
# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:46000
NEXT_PUBLIC_WS_URL=ws://localhost:46000
EOF
```

**CRITICAL**: Update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 46001",
    "start": "next start -p 46001"
  }
}
```

**Update Log**: Mark Step 3.2 complete

#### Step 3.3: Control Panel Tests
```bash
# Run tests
npm test

# With coverage
npm run test:coverage

# View coverage
open coverage/lcov-report/index.html
```

**MANDATORY**: All tests must pass

**Update Log**: Mark Step 3.3 complete with test results

#### Step 3.4: Start Control Panel
```bash
# Start dev server
npm run dev

# Verify
open http://localhost:46001
```

**Update Log**: Mark Step 3.4 complete

---

### Phase 4: Demo UI Setup (Port 46002)

#### Step 4.1: Install Dependencies
```bash
cd ~/Projects/HossAI-DriveThru-Doc-v2/demo-ui

# Install packages
npm install

# Verify
npm list --depth=0
```

**Update Log**: Mark Step 4.1 complete

#### Step 4.2: Configuration
```bash
# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:46000
NEXT_PUBLIC_WS_URL=ws://localhost:46000
EOF
```

**CRITICAL**: Update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 46002",
    "start": "next start -p 46002"
  }
}
```

**Update Log**: Mark Step 4.2 complete

#### Step 4.3: Demo UI Tests
```bash
# Run tests
npm test

# With coverage
npm run test:coverage

# View coverage
open coverage/lcov-report/index.html
```

**MANDATORY**: All tests must pass

**Update Log**: Mark Step 4.3 complete with test results

#### Step 4.4: Start Demo UI
```bash
# Start dev server
npm run dev

# Verify
open http://localhost:46002
```

**Update Log**: Mark Step 4.4 complete

---

### Phase 5: End-to-End Testing

#### Step 5.1: Install Playwright
```bash
cd ~/Projects/HossAI-DriveThru-Doc-v2

# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

**CRITICAL**: Update `playwright.config.ts`:
```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:46002',
  },
  webServer: [
    {
      command: 'cd demo-ui && npm run dev',
      url: 'http://localhost:46002',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
```

**Update Log**: Mark Step 5.1 complete

#### Step 5.2: Run E2E Tests
```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# View report
npx playwright show-report
```

**MANDATORY**: All E2E tests must pass

**Update Log**: Mark Step 5.2 complete with test results

---

### Phase 6: Documentation Updates

#### Step 6.1: Update All Port References
**Files to update:**
- `README.md`
- `docs/guides/*.md`
- `docs/testing/TESTING.md`
- All configuration files

**Search and replace:**
```bash
# Backend: 8000 → 46000
# Control Panel: 3000 → 46001
# Demo UI: 3001 → 46002
# PostgreSQL: 5432 → 46432
# Redis: 6379 → 46379

# Use this command
find . -type f \( -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" \) \
  -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/venv/*" \
  -exec sed -i '' 's/localhost:8000/localhost:46000/g' {} +
```

**Update Log**: Mark Step 6.1 complete with files updated count

#### Step 6.2: Verify Documentation
```bash
# Check all documentation
grep -r "8000" docs/ README.md || echo "✓ No old port 8000 found"
grep -r "3000" docs/ README.md || echo "✓ No old port 3000 found"
grep -r "3001" docs/ README.md || echo "✓ No old port 3001 found"
grep -r "5432" docs/ README.md || echo "✓ No old port 5432 found"
grep -r "6379" docs/ README.md || echo "✓ No old port 6379 found"
```

**Update Log**: Mark Step 6.2 complete

---

### Phase 7: Integration Verification

#### Step 7.1: Full System Test
```bash
# Start all services in separate terminals

# Terminal 1: Backend
cd ~/Projects/HossAI-DriveThru-Doc-v2
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 46000 --reload

# Terminal 2: Control Panel
cd ~/Projects/HossAI-DriveThru-Doc-v2/control-panel
npm run dev

# Terminal 3: Demo UI
cd ~/Projects/HossAI-DriveThru-Doc-v2/demo-ui
npm run dev

# Terminal 4: Verify all services
curl http://localhost:46000/health
curl http://localhost:46001
curl http://localhost:46002
```

**Update Log**: Mark Step 7.1 complete with all services status

#### Step 7.2: Manual Testing Checklist
- [ ] Backend API responding on port 46000
- [ ] API docs accessible at http://localhost:46000/docs
- [ ] Control Panel loading on port 46001
- [ ] Can navigate all Control Panel pages
- [ ] Demo UI loading on port 46002
- [ ] Language selection working
- [ ] Voice interface initializing (even if mocked)
- [ ] Database connection working
- [ ] Redis connection working
- [ ] All tests passing

**Update Log**: Mark Step 7.2 complete with checklist results

---

## 🔧 Troubleshooting Guide

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :46000
lsof -i :46001
lsof -i :46002
lsof -i :46432
lsof -i :46379

# Kill processes if needed
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
dropdb -p 46432 drivethru_db
createdb -p 46432 drivethru_db
python -c "from src.database import init_db; init_db()"
```

### Redis Issues
```bash
# Restart Redis
redis-cli -p 46379 shutdown
redis-server ~/redis-drivethru/redis.conf
```

### Node Module Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Progress Tracking

### Current Status Template
```markdown
## System Status: [DATE]

### Components
- [ ] Backend (Port 46000): [STATUS]
- [ ] Control Panel (Port 46001): [STATUS]
- [ ] Demo UI (Port 46002): [STATUS]
- [ ] PostgreSQL (Port 46432): [STATUS]
- [ ] Redis (Port 46379): [STATUS]

### Tests
- Backend: [X/Y passing]
- Control Panel: [X/Y passing]
- Demo UI: [X/Y passing]
- E2E: [X/Y passing]

### Documentation
- [ ] All ports updated to 46xxx
- [ ] README.md updated
- [ ] Configuration files updated
- [ ] Execution log current

### Issues
1. [Issue description] - [Status]
```

---

## 🎯 Success Criteria

### Phase Complete When:
1. ✅ All services running on 46xxx ports
2. ✅ All tests passing (100%)
3. ✅ Documentation updated and verified
4. ✅ Execution log current
5. ✅ No structural changes made
6. ✅ Manual testing checklist complete
7. ✅ All changes committed to git

---

## 📝 Final Checklist

Before marking project complete:

- [ ] All ports in 46xxx range
- [ ] Backend: 150+ tests passing
- [ ] Control Panel: All tests passing
- [ ] Demo UI: 130+ tests passing
- [ ] E2E: 20+ tests passing
- [ ] Documentation 100% accurate
- [ ] Execution log complete
- [ ] No TODO items remaining
- [ ] All services start successfully
- [ ] Integration testing complete
- [ ] Git repository clean

---

## 🚨 Emergency Recovery

If something breaks:

1. Check execution log for last successful step
2. Review what changed since then
3. Restore from git if needed: `git checkout [last-good-commit]`
4. Follow troubleshooting guide
5. Document the issue and resolution
6. Continue from last verified step

---

## 📞 Support

For issues:
1. Check execution log
2. Review troubleshooting guide
3. Check git history
4. Consult documentation in `/docs`

---

**Remember**: Update logs, respect structure, test thoroughly, document everything.

**Port Policy**: 46xxx range is MANDATORY and NON-NEGOTIABLE.
