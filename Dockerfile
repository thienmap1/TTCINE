FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server.js ./
COPY routes ./routes

EXPOSE 5000

CMD ["npm", "start"]