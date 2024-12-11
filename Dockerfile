# Stage 1: Build Stage
FROM oven/bun:latest AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN
ARG NUXT_PRIVATE_GITHUB_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV NUXT_PRIVATE_GITHUB_TOKEN=$NUXT_PRIVATE_GITHUB_TOKEN

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

COPY . .

RUN bun install

RUN bun run build

# Stage 2: Final Stage
FROM oven/bun:latest AS final

WORKDIR /app

COPY --from=build /app/.output .output

RUN rm -rf .output/server/node_modules
RUN rm -rf .output/server/package.json

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
