# Serverless-Social-Media-App

## Introduction

This application allows users to:

- Post images and videos (of upto 5 GB in size)
- Follow other users
- Like and comment on posts

By using serverless architecture, the application ensures high scalability and cost efficiency, making it a robust platform.

## Architecture

The application leverages the following architecture:

1. **Frontend**: Built with React.js for a dynamic and responsive user experience.
2. **Backend**: Serverless functions (AWS Lambda and API Gateway) handle API requests.
3. **Database**: Amazon DynamoDB for storing user data and posts.
4. **Storage**: Amazon S3 for storing media content such as images and videos.
