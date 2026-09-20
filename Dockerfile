FROM node:22-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

# 构建需要 devDependencies（vite / @react-router/dev 等），因此先完整安装
RUN npm ci && npm cache clean --force

COPY . .

# 生成 Postgres 版 Prisma Client + 构建前端与服务端
RUN npx prisma generate
RUN npm run build

# 裁剪 devDependencies，减小镜像体积（prisma CLI 在 dependencies 里，仍可用于 migrate deploy）
RUN npm prune --omit=dev

# docker-start = prisma generate && prisma migrate deploy && react-router-serve
CMD ["npm", "run", "docker-start"]
