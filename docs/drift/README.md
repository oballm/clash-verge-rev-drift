# Drift core + Clash Verge Rev (local)

This checkout (`drift-core` branch) wires a **Drift-enabled mihomo** sidecar and
minimal client typing so `type: drift` nodes survive profile YAML / URI paste.

Secrets live only under `/workspace/mihomo-drift/examples/` — do not paste PSKs
into commits or docs.

## Layout

| Path | Role |
|------|------|
| `/workspace/mihomo-drift` | Forked mihomo (tag base v1.19.31) with Drift outbound |
| `/workspace/mihomo-drift/bin/mihomo-drift` | Built linux/amd64 core |
| `/workspace/drift-protocol` | Protocol library (`go.mod` replace) |
| `/workspace/mihomo-drift/examples/drift-us1.yaml` | Working us1 creds (local secrets) |
| `scripts/use-drift-core.sh` | Copies Drift binary into `src-tauri/sidecar/` |

## Sidecar naming

`scripts/prebuild.mjs` downloads MetaCubeX releases as:

- `src-tauri/sidecar/verge-mihomo-<rustc-host>`
- `src-tauri/sidecar/verge-mihomo-alpha-<rustc-host>`

On this Linux box host is `x86_64-unknown-linux-gnu`.

**Chosen approach:** keep stock `prebuild` (geo/resources still download), then
overwrite the mihomo sidecars with Drift:

```bash
cd /workspace/clash-verge-rev
# optional: pnpm prebuild   # downloads Meta + geo assets
./scripts/use-drift-core.sh --also-alpha
```

Override source binary with `DRIFT_CORE=/path/to/binary`.

## Rebuild Drift core

```bash
cd /workspace/mihomo-drift
go build -o bin/mihomo-drift .
# then refresh sidecar:
/workspace/clash-verge-rev/scripts/use-drift-core.sh --also-alpha
```

## Add a Drift node in Verge

### A. Profile YAML (recommended MVP)

1. Profiles → import / create a **local** profile.
2. Open editor (YAML / advanced) and paste a proxy like:

```yaml
proxies:
  - name: us1-drift
    type: drift
    server: <host>
    port: <port>
    psk: "<64-hex>"
    server-public-key: "<64-hex>"
    uuid: "<uuid>"
    max-pad: 256
    multiplex: true
    udp: true
```

Copy real values from `/workspace/mihomo-drift/examples/drift-us1.yaml`
(do not commit that file into Verge).

Or import the sample at `docs/drift/sample-profile.yaml` after filling secrets.

### B. URI paste (Proxies editor)

```
drift://<uuid>@<server>:<port>?psk=<hex>&server-public-key=<hex>&max-pad=256&multiplex=true#us1-drift
```

### C. Group filter

Proxy-group `filter` autocomplete includes **Drift** (adapter type name).

## Smoke without GUI

```bash
# config test
/workspace/clash-verge-rev/src-tauri/sidecar/verge-mihomo-x86_64-unknown-linux-gnu \
  -t -f /workspace/mihomo-drift/examples/drift-us1.yaml

# live mixed-port (us1); ports from that YAML
/workspace/clash-verge-rev/src-tauri/sidecar/verge-mihomo-x86_64-unknown-linux-gnu \
  -f /workspace/mihomo-drift/examples/drift-us1.yaml &
curl -x http://127.0.0.1:17901 -o /dev/null -w '%{http_code}\n' \
  https://www.gstatic.com/generate_204
```

## Windows / macOS

Cross-build mihomo-drift for the target OS/arch, then either:

- run `use-drift-core.sh` on that machine (detects local `rustc` host), or
- copy as `verge-mihomo-<triple>` / `verge-mihomo-alpha-<triple>` under
  `src-tauri/sidecar/` (`.exe` on Windows).

Stock Verge install: replace the same-named binary next to the app / in its
resources after install (exact path OS-dependent).
