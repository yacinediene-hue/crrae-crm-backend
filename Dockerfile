FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

CMD ["sh", "-c", "node startup.js && npx prisma migrate resolve --applied 20260329232010_refonte_deals_adhesions 2>/dev/null; npx prisma migrate deploy && node dist/src/main.js"]
