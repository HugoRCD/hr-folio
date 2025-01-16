---
title: "From Local to Production: Deploy the Latest Nuxt Stack with Docker"
description: Learn how to properly containerize and deploy a Nuxt application
  using the latest versions of Nuxt UI and Content. Set up Docker with best
  practices, automate builds with GitHub Actions, and deploy your application
  anywhere.
date: 15/01/2025
---

# From Local to Production: Deploy the Latest Nuxt Stack with Docker :prose-icon{align name="simple-icons:nuxtdotjs" size="30px"}

The modern Nuxt stack is evolving rapidly, bringing exciting new features and improvements. In this guide, we'll explore how to properly containerize and deploy a Nuxt application using the latest versions of Nuxt UI and Content. You'll learn how to set up Docker with best practices, automate builds with GitHub Actions, and deploy your application anywhere - whether it's Coolify, your own server, or any other platform.

As of January 2025, we're working with some cutting-edge versions:

- Nuxt UI v3.0.0-alpha.11 - A powerful component library revolutionizing UI development
- Nuxt Content v3.0.0-alpha.8 - Content management reimagined
- Nuxt v3.15.1 - The rock-solid foundation

While these alpha versions are still evolving, they're stable enough for production use and offer significant improvements over their predecessors. Let's dive into containerizing this stack properly.

## Setting Up Your Project

Before we start with Docker, ensure your Nuxt project is properly configured. Here's a minimal `package.json`:

```json [package.json]
{
  "name": "nuxt-app",
  "private": true,
  "dependencies": {
    "@nuxt/content": "3.0.0",
    "@nuxt/ui": "^3.0.0-alpha.11",
    "@nuxt/image": "1.9.0",
    "nuxt": "^3.15.1"
  }
}
```

## The Dockerfile Explained :prose-icon{align name="simple-icons:docker" size="30px"}

Our `Dockerfile` uses a multi-stage build process to create an optimized production image. Let's break down each section:

```dockerfile [Dockerfile]
FROM node:22.13.0-alpine AS build

WORKDIR /app
COPY pnpm-lock.yaml package.json ./

# Enable corepack for pnpm support
RUN corepack enable
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm run build

FROM node:22.13.0-alpine AS final
WORKDIR /app
COPY --from=build /app/.output .output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

💡 Pro Tips:

- Using `alpine` reduces the base image size by \~300MB
- `corepack enable` manages pnpm versions consistently across environments
- The multi-stage build can reduce final image size by up to 90%
- `--frozen-lockfile` ensures dependency versions match exactly
- Only copying the `.output` directory prevents source code from being included in the production image

## Docker Compose Configuration

The `docker-compose.yml` file orchestrates our container setup:

```yaml [docker-compose.yml]
services:
  nuxt-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nuxt-app
    restart: always
    ports:
      - "3000:3000"
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:3000/api/hello" ]
      interval: 30s
      timeout: 10s
    deploy:
      resources:
        limits:
          memory: 1G
```

💡 Key Features:

- restart: always ensures your app recovers from crashes
- The healthcheck endpoint verifies your application is truly running
- Resource limits prevent container memory leaks
- Port mapping allows direct access to your application

The healthcheck ensures your application is responding properly. If you want to add custom health endpoints, create an API route in your Nuxt app:

```ts [server/api/hello.ts]
export default defineEventHandler(() => {
  return 'Hello World!'
})
```

## Automated Builds with GitHub Actions :prose-icon{align name="simple-icons:github" size="30px"}

Here's a sophisticated GitHub Action that builds and pushes images when you create a tag or trigger it manually:

```yaml [.github/workflows/build-and-push.yml]
name: Build and Push Portfolio Docker Image

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Version tag (ex: v1.0.0)'
        required: true
        type: string

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=tag
            type=raw,value=${{ inputs.tag }},enable=${{ github.event_name == 'workflow_dispatch' }}
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

💡 Workflow Features:

- It triggers on git tags (v1.0.0, v2.0.0, etc.)
- Supports manual triggers with custom version tags
- Uses GitHub's cache to speed up builds
- Automatically tags images with both version and latest tags
- Use the repository's name as the image name (update `IMAGE_NAME` if needed)

To use this setup:

1. Publish a new release with a version tag (v1.0.0, v2.0.0, etc.) in your GitHub repository or push a new tag: `git tag v1.0.0 && git push --tags`
2. Or manually trigger the workflow from GitHub's Actions tab Your images will be available at ghcr.io/yourusername/your-repo\:v1.0.0

💡 Production Tips:

- Always use specific version tags in production
- Set up monitoring for the health check endpoint
- Configure proper logging
- Use environment variables for configuration
- Set up SSL/TLS termination

## (Bonus) Deploying with Coolify

With your Docker image automatically published to GitHub Registry, deploying with Coolify becomes straightforward:

1. Connect to your Coolify instance
2. Create a new service using your container image
3. Set `ghcr.io/yourusername/your-repo:latest` as the image source
4. Configure your environment variables
5. Deploy!

💡 **Pro Tip**: Use semantic versioning tags (v1.0.0) in production instead of 'latest' for better stability and rollback capabilities.

You can find a complete working example in the [Canvas repository](https://github.com/HugoRCD/canvas), one of my open-source projects. And an even more complex one in the [Shelve's repository](https://git.new/shelve). Shelve is a complex but understandable project monorepo.

See it in action here: <https://canvas.hrcd.fr>

Remember that while Nuxt UI and Content are in alpha, they're actively developed and regularly updated. Keep an eye on the official releases for production use, and always test thoroughly before upgrading.
