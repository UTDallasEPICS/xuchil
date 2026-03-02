# Administration Scripts

Scripts to manage users and inventory from the terminal.

## Create User

Interactive mode:
```bash
pnpm user:create
```

With arguments:
```bash
pnpm user:create --email="user@example.com" --password="Pass123" --name="John Doe" --role=1 --admin
```

Available arguments:
- `--email=` - User email (unique)
- `--password=` - Password in plain text (will be hashed with bcrypt)
- `--name=` - Full name of the worker
- `--phone=` - Phone number (optional)
- `--role=` - Role ID (number)
- `--admin` - Flag to make the user an administrator

## List Users

```bash
pnpm user:list
```

Shows all registered users with their details.

## View Inventory Statistics

```bash
pnpm inventory:stats
```

Shows:
- Total items (raw materials and products)
- Total batches/lots
- Incoming/outgoing movements
- Items with available stock

## Clear Inventory

```bash
pnpm inventory:clear
```

WARNING: Deletes ALL inventory data:
- Inventory movements
- Inventory lots
- Inventory items
- Material usage in steps

Force mode (without confirmation):
```bash
pnpm inventory:clear --force
```

## Direct Execution

You can run the scripts directly with tsx:
```bash
pnpm tsx scripts/create-user.ts
pnpm tsx scripts/list-users.ts
pnpm tsx scripts/inventory-stats.ts
pnpm tsx scripts/clear-inventory.ts
```
