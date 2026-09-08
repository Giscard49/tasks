
  # Modern Mobile To-Do List App

  This is a code bundle for Modern Mobile To-Do List App. The original project is available at https://www.figma.com/design/NHyKPfEujvXHIjOVcpdVit/Modern-Mobile-To-Do-List-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Backend

The Express API lives in `backend/` and uses MongoDB. Copy `backend/.env.example` to
`backend/.env`, set `MONGO_URI` and a long `JWT_SECRET`, then run:

```bash
cd backend
npm install
npm run dev
```

Authentication is available at `POST /api/auth/register` and `POST /api/auth/login`.
Send the returned token as `Authorization: Bearer <token>`. Tasks are private to their
owner by default. Owners can share a task with another username using
`POST /api/tasks/:id/share` and choose `read` or `write` permission.
  