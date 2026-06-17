---
name: cd-algojunction
description: |
  Use when discussing or troubleshooting the AlgoJunction server CD pipeline,
  server deployment on the Oracle VM, SSH setup, GitHub Actions secrets,
  PM2 management, or any server infrastructure topic.
---

# AlgoJunction Server CD Pipeline

## Architecture

```
GitHub (main branch)
    │
    ▼ (workflow_run — only after CI passes)
GitHub Actions → appleboy/ssh-action@v1
    │
    ▼ (SSH as ubuntu)
Oracle VM (129.154.35.117)
    ├── /home/ubuntu/myprojects/AlgoJunction/
    │   └── server/
    │       ├── .env               ← MONGODB_URI (gitignored, manually created on VM)
    │       ├── ecosystem.config.cjs
    │       └── src/docker/Dockerfile  ← Java executor
    ├── PM2 (algojunction-server)  ← runs src/index.js on port 3000
    ├── Nginx                      ← reverse proxy api.algojunction.* → :3000
    └── Docker                     ← algojunction-java-executor image
```

## CD Workflow (`.github/workflows/cd-server.yml`)

**Triggers:**
- `workflow_run` on CI passing for `main` branch
- `workflow_dispatch` (manual override)

**Steps:**
1. SSH into VM as `ubuntu`
2. `git pull origin main`
3. Detect nginx config changes via `git diff`
4. `yarn install --frozen-lockfile` in `server/`
5. `docker build -t algojunction-java-executor server/src/docker`
6. `pm2 delete` + `pm2 start` (restart server)
7. Reload nginx only if its config changed

## GitHub Secrets Required

Set in repo → Settings → Secrets and Variables → Actions:

| Secret | Value |
|---|---|
| `VM_HOST` | `129.154.35.117` |
| `VM_USER` | `ubuntu` |
| `VM_SSH_KEY` | PEM-format private key (see below) |

## SSH Key Setup

Generate a **separate** key for CI (won't touch personal keys):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/algojunction_cd
```

**Convert to PEM format** (appleboy/ssh-action requires this):

```bash
ssh-keygen -p -m PEM -f ~/.ssh/algojunction_cd
```

Copy public key to VM:

```bash
ssh-copy-id -i ~/.ssh/algojunction_cd.pub ubuntu@129.154.35.117
```

Add **private key** (`cat ~/.ssh/algojunction_cd`) as `VM_SSH_KEY` secret.

## Troubleshooting

| Error | Fix |
|---|---|
| `ssh: no key found` | Key is in OpenSSH format — run `ssh-keygen -p -m PEM` |
| `corepack enable` permission error | Don't use `corepack enable` in the script; yarn is already installed on the VM |
| `yarn: command not found` | Install yarn globally on VM: `npm i -g yarn` |
| PM2 fails | PM2 must be in PATH for non-interactive SSH. Install globally: `npm i -g pm2` |
| Docker permission denied | Ensure `ubuntu` is in `docker` group: `sudo usermod -aG docker ubuntu` |

## Manual Deploy (if needed)

```bash
ssh ubuntu@129.154.35.117
cd /home/ubuntu/myprojects/AlgoJunction
git pull origin main
cd server && yarn install --frozen-lockfile
docker build -t algojunction-java-executor src/docker
pm2 delete algojunction-server 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
```
