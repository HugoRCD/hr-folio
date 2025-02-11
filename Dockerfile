# Stage 1: Build Stage
FROM node:22.13.1-alpine AS build

ARG NUXT_PRIVATE_GITHUB_TOKEN
ENV NUXT_PRIVATE_GITHUB_TOKEN=$NUXT_PRIVATE_GITHUB_TOKEN

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install

COPY . .

RUN pnpm run build

# Stage 2: Final Stage
FROM node:22.13.1-alpine AS final

WORKDIR /app

COPY --from=build /app/.output .output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
