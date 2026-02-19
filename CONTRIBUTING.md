# Contributing to IoT Drone Defense System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information (OS, browser, Node version)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/iot-drone-defense-system.git

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development
npm run dev
```

## Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure
- Write clean, readable code
- Test your changes

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

## Testing

- Test all features before submitting PR
- Ensure no breaking changes
- Test on multiple browsers if frontend changes
- Test API endpoints if backend changes

## Documentation

- Update README.md if needed
- Add comments to complex code
- Update API documentation for new endpoints
- Include examples for new features

## Questions?

Feel free to ask questions in:
- GitHub Issues
- Pull Request comments
- Project discussions

Thank you for contributing! 🎉
