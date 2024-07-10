<br />
<p align="center">
  <h1 align="center">
  <a href="https://gillyhuga.com/">
    Reimbursement - System
  </a>
  </h1>

### Built With
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Ant Design](https://ant.design/)
- [Prisma](https://www.prisma.io/)
  
## Getting Started

### Prerequisites
- [Node >= v18.17.0](https://nodejs.org/en/)

### Installation
- Clone repository
  ```
     https://github.com/gillyhuga/test-reimbursement.git
  ```
- Go to the project directory
  ```
     cd test-reimbursement
  ```
- Install dependencies

  ```
     npm install
  ```
- Update .env with your Database URL:
  ```
     DATABASE_URL = your_postgree_db_url
  ```
- Migrate database table:
  ```
     npx prisma migrate dev
  ```
- Migrate database table:
  ```
     npx prisma migrate dev
  ```
- Run database seeder:
  ```
     npm run prisma-seed
  ```
- Start the server
  ```
     npm run dev
  ```
- Open `http://localhost:3000` with your browser to see the result

### Running the Application
To run the application in your local environment, follow these steps:

1. Ensure you have the prerequisites installed.
2. Follow the installation steps provided above.
3. Use `npm run dev` to start the server in development mode.

