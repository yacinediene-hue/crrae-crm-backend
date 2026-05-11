FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

CMD ["sh", "-c", "node startup.js && npx prisma migrate resolve --applied 20260329232010_refonte_deals_adhesions 2>/dev/null; npx prisma migrate resolve --applied 20260330211023_ajout_profil_client_contact 2>/dev/null; npx prisma migrate resolve --applied 20260330220802_campaign_targeting 2>/dev/null; npx prisma migrate resolve --applied 20260401100235_add_audit_log 2>/dev/null; npx prisma migrate resolve --applied 20260401104931_add_campaign_date_envoi 2>/dev/null; npx prisma migrate resolve --applied 20260401124012_add_password_reset_token 2>/dev/null; npx prisma migrate resolve --applied 20260401200000_fix_reset_token_columns 2>/dev/null; npx prisma migrate resolve --applied 20260406100000_add_canal_demande_enum 2>/dev/null; npx prisma migrate resolve --applied 20260406200000_add_date_envoi_enquete 2>/dev/null; npx prisma migrate resolve --applied 20260510000000_add_niveau_traitement 2>/dev/null; npx prisma migrate resolve --applied 20260512000000_contact_email_optional 2>/dev/null; npx prisma migrate resolve --applied 20260512000001_user_email_optional 2>/dev/null; npx prisma migrate deploy && node dist/src/main.js"]
