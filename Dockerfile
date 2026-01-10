# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies if any (not needed for this app)
# RUN apt-get update && apt-get install -y ...

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Make port variable available
ENV PORT=5000
EXPOSE 5000

# Run the application
# Use the $PORT environment variable which Render provides automatically
CMD gunicorn --bind 0.0.0.0:$PORT app:app
