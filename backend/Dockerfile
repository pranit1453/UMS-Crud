# Use lightweight official Python image
FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Create virtual environment
RUN python -m venv /opt/venv

# Use virtual environment for all subsequent commands
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install dependencies
COPY requirements.txt .

# Install dependencies inside virtual environment
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY ums/ /app/ums/

# Expose Flask API port
EXPOSE 5000

# Run Flask backend server
CMD ["python", "ums/run.py"]