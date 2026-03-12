FROM nvidia/cuda:12.6.3-devel-ubuntu24.04

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    git \
    software-properties-common \
    curl \
    build-essential \
    wget \
    portaudio19-dev \    
    libasound2-dev \     
    ffmpeg \             
    libgl1 \
    libglx-mesa0 \
    ca-certificates \
    gnupg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update \
    && apt-get install -y python3.13 python3.13-venv python3.13-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.13 \
    && python3.13 -m pip install --upgrade pip setuptools wheel

COPY ./requirement.txt /app/requirement.txt
RUN python3.13 -m pip install --no-cache-dir --break-system-packages --upgrade pip setuptools wheel
RUN python3.13 -m pip install --no-cache-dir --break-system-packages --ignore-installed -r /app/requirement.txt


COPY ./requirement_langchain.txt /app/requirement_langchain.txt
RUN python3.13 -m pip install --no-cache-dir --break-system-packages --ignore-installed -r /app/requirement_langchain.txt

WORKDIR /app/osce-backend
