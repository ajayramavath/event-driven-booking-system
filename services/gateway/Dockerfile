FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install

COPY src ./src

EXPOSE 3000

CMD ["bun" , "run" , "src/index.ts"]