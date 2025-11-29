This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This section has been moved to **Project Setup**.

## Project Setup

Follow these steps to get the project running locally:

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Set up Environment Variables**

    Create a `.env` file in the root of the project and add the following line. This connects to a local MySQL database named `database_name` with username `root` and password `root`. Make sure you have MySQL server running.

    ```
    DATABASE_URL="mysql://root:root@localhost:3306/database_name"
    ```

3.  **Apply the Database Schema**

    This command will sync your database schema with your Prisma schema.

    ```bash
    npx prisma db push
    ```
    *Note: We use `db push` here to avoid potential issues with creating a shadow database in some local MySQL environments.*


4.  **Seed the Database**

    This will populate the database with some initial data, including a test user and some sample entries.

    ```bash
    npx prisma db seed
    ```

    The test user credentials are:
    - **Email:** `test@test.com`
    - **Password:** `password`

5.  **Run the Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
