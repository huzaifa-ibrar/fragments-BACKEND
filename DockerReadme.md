Now you need to add your Docker Hub credentials as GitHub secrets. Here's how:

Generate a Docker Hub access token:

Go to https://hub.docker.com/settings/security
Click "New Access Token"
Give it a name (e.g., "github-actions")
Copy the token
Add GitHub Secrets:

Go to your GitHub repository
Click Settings → Secrets and variables → Actions
Add two new secrets:
Name: DOCKERHUB_USERNAME

Value: Your Docker Hub username

Name: DOCKERHUB_TOKEN

Value: The access token you just created

Optimized .dockerignore:

Excludes all unnecessary files
Improves build context and performance
Better security by excluding sensitive files
Enhanced multi-stage Dockerfile:

Stage 1 (deps): Install dependencies
Stage 2 (builder): Run tests and linting
Stage 3 (runner): Production image
Security features:
Non-root user
Minimal dependencies
Production-only modules
Optimizations:
Layer caching
Smaller final image
Clean-up steps
GitHub Actions Workflow:

Automatic builds on push to main
Multi-platform build support
Caching for faster builds
Secure credential handling
Proper tagging strategy
Pull request support


## Docker Setup

1. Build locally.
```bash
docker build -t fragments .
```

2. Tag for Docker Hub:
```bash
docker tag fragments YOUR_DOCKERHUB_USERNAME/fragments:latest
```

3. Push manually (if needed):
```bash
docker login
docker push YOUR_DOCKERHUB_USERNAME/fragments:latest
```

The GitHub Actions workflow will automatically:

Build your image
Run tests
Push to Docker Hub (on main branch commits)
Tag with appropriate versions
Cache layers for faster builds
Remember to:

Replace YOUR_DOCKERHUB_USERNAME with your actual Docker Hub username
Add the GitHub secrets for Docker Hub authentication
Make sure your repository has the necessary permissions 