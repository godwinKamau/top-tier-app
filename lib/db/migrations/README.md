# Migrations

The Neon database was provisioned **before** drizzle was added to this repo, so
there is no drizzle migration journal in it and these files are not a history
drizzle has ever replayed.

- `0000_chemical_shadowcat.sql` — a baseline produced with `drizzle-kit pull`,
  recording the schema exactly as it already existed. It has never been run and
  must not be: the tables it creates are already there. It is checked in because
  it is otherwise the only record in version control of a schema that was
  created by hand.
- `0001_add_applicant_challenge.sql` — the one real change: the apply form asks
  for a primary academic challenge and `applicants` had nowhere to put it, so
  the answer was shown in the confirmation email and then discarded.

## Applying 0001

Either run the file directly against the database, or let drizzle diff it:

```sh
npx drizzle-kit push    # compares lib/db/schema.ts to the live database
```

## Before relying on `drizzle-kit generate`

`meta/` still describes the baseline only, so the next `generate` will try to add
`challenge` a second time. Once `0001` is applied, re-baseline so the snapshot
matches reality:

```sh
rm -rf lib/db/migrations && npx drizzle-kit pull
```

After that, `generate` → `migrate` works normally for future changes.
