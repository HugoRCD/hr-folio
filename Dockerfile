# Stage 1: Build Stage
FROM node:22.12.0-alpine AS build

RUN apk add --no-cache python3 make g++ \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

ARG TURBO_TEAM
ARG TURBO_TOKEN
ARG NUXT_PRIVATE_GITHUB_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV NUXT_PRIVATE_GITHUB_TOKEN=$NUXT_PRIVATE_GITHUB_TOKEN

WORKDIR /app

COPY package.json ./

COPY . .

RUN pnpm install --frozen-lockfile --prod
RUN pnpm run build

# Stage 2: Final Stage
FROM node:22.12.0-alpine AS final

WORKDIR /app

COPY --from=build /app/.output .output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
