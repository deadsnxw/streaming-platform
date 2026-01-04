FROM node:18-alpine

WORKDIR /app

# Копируем package.json из backend
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь backend код
COPY . .

# Открываем порт
EXPOSE 5000

# Запускаем сервер
CMD ["npm", "run", "dev"]