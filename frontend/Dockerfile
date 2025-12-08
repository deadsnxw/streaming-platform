FROM node:18-alpine

WORKDIR /app

# Копируем package.json из frontend
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь frontend код
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем dev-сервер
CMD ["npm", "start"]