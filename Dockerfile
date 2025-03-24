# Stage 1: Build Stage
FROM node:22.14.0-alpine AS build

ARG NUXT_PRIVATE_GITHUB_TOKEN
ENV NUXT_PRIVATE_GITHUB_TOKEN=$NUXT_PRIVATE_GITHUB_TOKEN

ARG NUXT_UI_PRO_LICENSE
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install

COPY . .

RUN pnpm run build

# Stage 2: Final Stage
FROM node:22.14.0-alpine AS final

WORKDIR /app

COPY --from=build /app/.output .output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
