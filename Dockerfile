# Stage 1: Build Stage
FROM node:22.13.0-alpine AS build

ARG NUXT_PRIVATE_GITHUB_TOKEN
ENV NUXT_PRIVATE_GITHUB_TOKEN=$NUXT_PRIVATE_GITHUB_TOKEN

RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile --prod

RUN pnpm run build

# Stage 2: Final Stage
FROM node:22.13.0-alpine AS final

WORKDIR /app

COPY --from=build /app/.output .output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
