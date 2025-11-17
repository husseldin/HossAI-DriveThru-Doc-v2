# Implementation Guidelines for Development Agents

- **Document Version**: 1.0
- **Date**: 2025-11-17
- **Status**: Approved
- **Author**: Technical Documentation Team

## 1. Introduction

This document provides a template and guidelines for development agents implementing the AI Drive-Thru Demo Application. Follow these instructions to ensure consistent, high-quality implementation aligned with the project requirements.

## 2. Pre-Implementation Checklist

Before starting implementation, ensure you have:

- [ ] Read the Architecture Overview
- [ ] Reviewed the relevant BRD Level 2 sections
- [ ] Understood the Build Phase Plan for your phase
- [ ] Reviewed the Testing Strategy
- [ ] Set up development environment
- [ ] Reviewed Model Recommendations
- [ ] Understood the Configuration System

## 3. Implementation Workflow

### 3.1 Start of Task

1. **Review Requirements**
   - Read relevant documentation sections
   - Understand acceptance criteria
   - Identify dependencies

2. **Plan Implementation**
   - Break down task into subtasks
   - Identify required files and components
   - Plan testing approach

3. **Create Implementation Log Entry**
   - Use Implementation Log Template
   - Document your plan
   - Set status to "In Progress"

### 3.2 During Implementation

1. **Follow Coding Standards**
   - Use consistent code style
   - Write clear, documented code
   - Follow project structure

2. **Test as You Go**
   - Write unit tests
   - Test functionality incrementally
   - Fix issues immediately

3. **Update Log Regularly**
   - Log significant progress
   - Document issues encountered
   - Update next actions

### 3.3 Completion of Task

1. **Final Testing**
   - Run all relevant tests
   - Verify acceptance criteria
   - Test edge cases

2. **Update Documentation**
   - Update code comments
   - Update API documentation if needed
   - Update implementation log

3. **Code Review Preparation**
   - Ensure code is clean
   - Verify all tests pass
   - Prepare summary of changes

## 4. Documentation References

### 4.1 Core Documents

1. **Architecture Overview**: System design and architecture
2. **BRD Level 1**: Business requirements and goals
3. **BRD Level 2**: Detailed functional specifications
4. **Workflow Diagrams**: System workflows and flows
5. **UI/UX Specification**: User interface requirements
6. **Configuration System**: Dynamic configuration details
7. **Model Recommendations**: AI model selection and setup
8. **Build Phase Plan**: Phase-by-phase implementation plan
9. **Testing Strategy**: Test cases and testing approach

### 4.2 When to Reference Each Document

- **Starting New Phase**: Read Build Phase Plan
- **Implementing Feature**: Read BRD Level 2 relevant section
- **Designing Component**: Read Architecture Overview
- **Creating UI**: Read UI/UX Specification
- **Configuring System**: Read Configuration System
- **Selecting Models**: Read Model Recommendations
- **Writing Tests**: Read Testing Strategy
- **Understanding Flow**: Read Workflow Diagrams

## 5. Phase-Specific Guidelines

### 5.1 Phase 1: Voice System

**Key Focus Areas**:
- STT integration and optimization
- TTS integration and quality
- Language detection accuracy
- Interruption handling
- Performance (latency requirements)

**Critical Requirements**:
- STT latency < 500ms
- TTS latency < 1s
- Language detection > 95% Arabic, > 90% English
- Interrupt detection < 200ms

**Common Pitfalls**:
- Not testing on Mac Studio hardware
- Ignoring Metal acceleration setup
- Not handling audio device errors
- Missing language detection edge cases

### 5.2 Phase 2: Menu System

**Key Focus Areas**:
- Database schema design
- Menu validation
- Menu caching
- API design

**Critical Requirements**:
- Hierarchical menu structure
- Arabic and English support
- Real-time menu updates
- Menu validation

**Common Pitfalls**:
- Over-complicating schema
- Not considering performance
- Missing validation rules
- Not testing edge cases

### 5.3 Phase 3: NLU + Intent

**Key Focus Areas**:
- LLM integration
- Intent classification accuracy
- Slot extraction
- Keyword matching

**Critical Requirements**:
- Intent accuracy > 92%
- Slot extraction > 90%
- Keyword matching > 85%
- NLU latency < 200ms

**Common Pitfalls**:
- Not optimizing prompts
- Ignoring Arabic-specific challenges
- Not handling ambiguous intents
- Missing keyword variations

### 5.4 Phase 4: Control Panel

**Key Focus Areas**:
- UI/UX implementation
- Real-time updates
- Configuration validation
- Hot reload

**Critical Requirements**:
- All settings configurable
- Updates within 5 seconds
- Validation prevents errors
- Hot reload works

**Common Pitfalls**:
- Complex UI confusing users
- Not validating configurations
- Missing error handling
- Not testing real-time updates

### 5.5 Phase 5: Demo UI

**Key Focus Areas**:
- User experience
- Visual feedback
- Order management
- Error handling

**Critical Requirements**:
- Smooth interactions
- Clear feedback
- Accurate order display
- Good error messages

**Common Pitfalls**:
- Poor visual feedback
- Confusing error messages
- Not handling edge cases
- Performance issues

### 5.6 Phase 6: Integration

**Key Focus Areas**:
- End-to-end integration
- Performance optimization
- Bug fixing
- Documentation

**Critical Requirements**:
- All components work together
- Performance meets requirements
- All tests pass
- Documentation complete

**Common Pitfalls**:
- Integration issues not caught early
- Performance not optimized
- Missing edge cases
- Incomplete documentation

## 6. Code Quality Standards

### 6.1 Code Style

- **Python**: Follow PEP 8
- **JavaScript/TypeScript**: Follow ESLint rules
- **Comments**: Clear, concise, explain why not what
- **Naming**: Descriptive, consistent naming conventions

### 6.2 Documentation

- **Function Docstrings**: All functions documented
- **Class Docstrings**: All classes documented
- **API Documentation**: All endpoints documented
- **README Updates**: Update README for new features

### 6.3 Testing

- **Unit Tests**: > 80% code coverage
- **Integration Tests**: All major flows tested
- **Test Quality**: Tests are clear and maintainable
- **Test Data**: Use realistic test data

## 7. Execution Log Format

Use this format for implementation logs:

```
## Entry [Number] - [Date/Time]

**Agent Name**: [Your Name]
**Phase**: [Phase Number and Name]
**Task**: [Task Description]
**Status**: [Success / Failure / In Progress / Blocked]

### Files Changed
- [File path]: [Description]

### Implementation Details
[What was implemented]

### Testing
- [x] Unit tests written
- [x] Integration tests written
- [x] Manual testing completed
- [x] Test results: [Pass / Fail]

### Issues Encountered
- [Issue and resolution]

### Notes
[Additional notes]

### Next Actions
- [ ] [Next task]
```

## 8. Testing Requirements

### 8.1 Before Marking Complete

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Acceptance criteria met
- [ ] Performance requirements met
- [ ] Code reviewed (if applicable)

### 8.2 Test Coverage

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test component interactions
- **System Tests**: Test end-to-end flows
- **Performance Tests**: Test latency and throughput

### 8.3 Test Documentation

- Document test cases
- Explain test scenarios
- Include test data
- Document expected results

## 9. Common Issues and Solutions

### 9.1 Model Performance

**Issue**: Models too slow
**Solutions**:
- Use quantized models
- Optimize batch processing
- Implement caching
- Use Metal acceleration

### 9.2 Language Detection

**Issue**: Low detection accuracy
**Solutions**:
- Tune confidence thresholds
- Improve language models
- Add more training data
- Handle edge cases

### 9.3 Configuration Updates

**Issue**: Updates not applying
**Solutions**:
- Check validation
- Verify hot reload
- Check cache invalidation
- Review service notifications

### 9.4 Performance Issues

**Issue**: System too slow
**Solutions**:
- Profile and optimize
- Implement caching
- Optimize database queries
- Reduce model latency

## 10. Communication Guidelines

### 10.1 When to Ask for Help

- Blocked for > 2 hours
- Unclear requirements
- Technical issues you can't resolve
- Need clarification on design decisions

### 10.2 How to Ask for Help

1. **Describe the Problem**: Clear description
2. **What You've Tried**: Steps already taken
3. **Error Messages**: Include error logs
4. **Expected vs Actual**: What should happen vs what does
5. **Relevant Code**: Share relevant code snippets

### 10.3 Progress Updates

- Update implementation log daily
- Share blockers immediately
- Communicate delays early
- Celebrate milestones

## 11. Quality Checklist

Before submitting work, verify:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Implementation log updated
- [ ] Acceptance criteria met
- [ ] Performance requirements met
- [ ] Error handling implemented
- [ ] Edge cases handled
- [ ] Code reviewed (if applicable)

## 12. Best Practices

### 12.1 Development

- **Start Small**: Implement basic version first
- **Test Early**: Test as you develop
- **Iterate**: Refine based on testing
- **Document**: Document as you go

### 12.2 Code

- **Keep It Simple**: Simple solutions are better
- **DRY Principle**: Don't repeat yourself
- **Single Responsibility**: One function, one purpose
- **Error Handling**: Always handle errors

### 12.3 Testing

- **Test First**: Write tests before implementation (TDD if possible)
- **Test Edge Cases**: Don't just test happy path
- **Test Performance**: Verify performance requirements
- **Test Integration**: Test with other components

## 13. Resources

### 13.1 Documentation

- All documentation in `/docs` folder
- Architecture diagrams in Workflow Diagrams
- API specifications in BRD Level 2
- UI specifications in UI/UX Specification

### 13.2 Tools

- **Python**: 3.10+
- **Node.js**: 18+ (for frontend)
- **Database**: PostgreSQL/MySQL
- **Testing**: pytest, Playwright
- **Code Quality**: pylint, ESLint

### 13.3 External Resources

- Faster Whisper: https://github.com/guillaumekln/faster-whisper
- Coqui TTS: https://github.com/coqui-ai/TTS
- Llama.cpp: https://github.com/ggerganov/llama.cpp

## 14. Success Criteria

Your implementation is successful when:

- ✅ All acceptance criteria met
- ✅ All tests pass
- ✅ Performance requirements met
- ✅ Code quality standards met
- ✅ Documentation complete
- ✅ Ready for next phase or integration

---
