## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

You'll first need a Firebase project which can be made [via the ](https://firebase.google.com/).

### Clone and run locally

1.  Clone this project with Git

    ```bash
    git clone https://github.com/Kiwinoob/give4need
    ```

2.  Rename `.env.local.example` to `.env.local` and update the following:

    ```
     NEXT_PUBLIC_FIREBASE_API_KEY=[INSERT YOUR FIREBASE API KEY]
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
     NEXT_PUBLIC_FIREBASE_APP_ID=
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

    ```

    All KEY can be found in your Firebase Project settings

3.  You can now run the Next.js local development server:

    ```bash
    npm run dev
    ```

    The app should now be running on [localhost:3000](http://localhost:3000/).

## Acknowledgements

- [Firebase | Database & Authentication](https://firebase.google.com/)
- [shadcn/ui | React Component Library](https://ui.shadcn.com/)
