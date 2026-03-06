# express-postgres-template

To install dependencies:

```bash
bun install
```

Run migration
```bash
npx prisma migrate dev --name Init
npx prisma generate
```

To start the server:

```bash
bun run dev
```

To start the studio
```bash
bun run studio
```

To deploy
```bash
bun run build
```

