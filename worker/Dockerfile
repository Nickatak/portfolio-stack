FROM python:3.12-slim

WORKDIR /app

# Git is needed for pip install from GitHub.
RUN apt-get update && apt-get install -y --no-install-recommends git openssh-client && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY run_worker.py /app/run_worker.py

ENV PYTHONUNBUFFERED=1

CMD ["python3", "run_worker.py"]
