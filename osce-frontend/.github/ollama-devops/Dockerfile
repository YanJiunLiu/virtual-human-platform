FROM ubuntu:24.04

RUN apt-get update && apt-get install -y ca-certificates curl lsof software-properties-common \
    python3 python3-venv python3-pip python3-distutils-extra \
    && add-apt-repository universe \
    && apt-get update \
    && rm -rf /var/lib/apt/lists/*

ENV OLLAMA_MODELS="/usr/share/ollama/.ollama/models"
RUN curl -fsSL https://ollama.com/install.sh | sh

COPY python-api /python-api
WORKDIR /python-api

RUN python3 -m venv /venv \
    && /venv/bin/pip install --upgrade pip \
    && /venv/bin/pip install -r requirements.txt

EXPOSE 8000

CMD bash -c "ollama serve & exec /venv/bin/uvicorn call_ollama:app --host 0.0.0.0 --port 8000"
