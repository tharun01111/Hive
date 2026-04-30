FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm install --production
RUN ./node_modules/.bin/prisma generate
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
