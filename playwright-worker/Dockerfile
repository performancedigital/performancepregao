FROM mcr.microsoft.com/playwright:v1.45.0-jammy
WORKDIR /app
COPY package.json .
RUN npm install
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/server.js"]
