# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем manifest файлы
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Копируем исходный код
COPY . .

# Собираем production сборку
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Создаём non-root пользователь (Alpine)
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Копируем зависимости и сборку с правильными правами
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

# Открываем порт
EXPOSE 3000

# Запуск
CMD ["npm", "start"]
