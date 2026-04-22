FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt supervisor

COPY . .

CMD ["supervisord", "-c", "/app/supervisord.conf", "-n"]
