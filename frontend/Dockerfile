FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Since it's a dev share, we run in dev mode
CMD ["npm", "run", "dev", "--", "--host"]
