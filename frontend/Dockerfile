# ใช้ NodeJS เวอร์ชั่น LTS ที่เป็น Alpine (ขนาดเล็ก)
FROM node:20-alpine

# กำหนด Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

#ติดตั้ง Dependencies
RUN npm install

# Copy โค้ดทั้งหมด
COPY . .

# บอกให้ Docker รู้ว่า Container จะใช้ Port 5173
EXPOSE 5173

# คำสั่งสำหรับรัน Development Server ของ Vite
CMD [ "npm","run","dev" ]