FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads/notices

EXPOSE 5000

CMD ["npm", "run", "dev"]
