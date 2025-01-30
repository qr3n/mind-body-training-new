FROM node:alpine

# Установить рабочую директорию
WORKDIR /app

# Копировать исходники
COPY . .

# Установить зависимости
RUN npm install --force

# Собрать проект
RUN npm run build

# Открыть порт
EXPOSE 3000

# Запустить приложение
ENTRYPOINT [ "npm", "run", "start" ]
