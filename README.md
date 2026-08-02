# SiteCheck Cloud

Multi-user SiteCheck. Same forms, same PDFs, same offline behaviour — but
projects and records now live on a server, so a record signed on site appears
on everyone else's screen within a second or two.

This is a **separate app** from the single-device version. Both can run at once.

---

## Before it will work

### 1. Fix your own password

Your Supabase account was created with a password you typed by hand. The app
derives passwords from the User ID and PIN, so it needs changing to match.

In Supabase: **Authentication → Users**, click your user, and set the password to:

```
pougherg#12345
```

replacing `12345` with the 5-digit PIN you want. The rule is always:

```
<userid in lowercase>#<pin>
```

You will then sign in to the app with User ID `PougherG` and that PIN.

### 2. Upload the files

Into the `sitecheck-cloud` repository, exactly as before:

| | |
|---|---|
| `index.html` | the app |
| `db.js` | on-device storage and the offline queue |
| `cloud.js` | everything that talks to Supabase |
| `pdf.js` | PDF generation |
| `xlsx.js` | spreadsheet reports |
| `talks.js` | toolbox talk library |
| `activities.js` | risk assessment activities |
| `methods.js` | method statement outlines |
| `sw.js` | offline support |
| `manifest.webmanifest` | app name and icon |
| `README.md` | this file |
| `icons/` | folder — drag across whole |
| `lib/` | folder — jsPDF and the Supabase client |

Then **Settings → Pages → Deploy from a branch → main / root**.

It will appear at `https://garryp-creator.github.io/sitecheck-cloud/`

---

## Adding people

Two steps, because creating a login needs a privileged key that must never sit
in a browser.

**First, the login.** Supabase → Authentication → Add user:

- Email: `whitfieldd@wrm.internal` (their User ID, lowercase, plus `@wrm.internal`)
- Password: `whitfieldd#54321` (same User ID, then `#`, then their PIN)
- Tick **Auto confirm user**

**Then the profile.** In the app, sign in as yourself → **People** → **Add a person**.
Enter the same User ID, their real name, their email if you have it, and a role.
The screen shows you exactly what to type into Supabase as you go.

### Roles

| Role | Can do |
|---|---|
| **Site** | Record on projects shared with them |
| **Manager** | Create projects, share them, see everything shared with them |
| **Superuser** | Everything, plus manage people |

---

## What syncs, and what does not

**Signed records sync. Drafts do not.**

A half-finished form stays on the device that is writing it, autosaved every
second or so. Once it is signed it goes up, and from that moment it can never
be changed by anyone — the database itself refuses. Corrections are a new
record that references the old one.

This is deliberate, and it removes the hardest part of syncing: two people can
never disagree about a record neither of them can edit.

**Projects sync both ways.** Last save wins, which is fine for addresses and
client names.

**Accident reports are held back.** Sharing a project shares everything on it
except accident records, which stay with whoever raised them plus superusers.
They contain health information about named people.

---

## Offline

First sign-in needs a connection. After that the app opens and works with no
signal at all: forms fill in, records sign, and everything queues. The header
shows how many items are waiting. When signal returns it syncs on its own.

---

## Testing it works

In this order:

1. **Sign in** as `PougherG` with your PIN
2. **Create a project** — check it appears in Supabase → Table Editor → projects
3. **Complete a short form** and sign it — check the header says "Synced"
4. **Open the app on your phone**, sign in as the same user, and confirm the
   project and record are both there
5. **Add a second person**, share the project with them, and sign in as them on
   another device — they should see the project
6. **Aeroplane mode** — complete a form, confirm it saves and the header shows
   "Offline · 1 waiting", then turn signal back on and watch it clear
7. **Live update** — with two devices open on the same project, sign a record on
   one and watch it appear on the other without touching anything

---

## Known limits

**This has not been tested against a live database.** It was written against
the schema, but the environment it was built in could not reach Supabase, so
every path above needs walking through for real. Expect something to need
fixing on the first run — send the error and it will be quick to sort.

**A 5-digit PIN is not strong.** It is fine for a demo with invented data.
Before real records go in, this wants proper device enrolment: a longer one-time
code to set a device up, then the PIN unlocking it locally.

**Free tier projects pause after about a week of inactivity.** Open the app
every few days, and restore the project from the Supabase dashboard on the
morning of any demo.

**Documents need a connection.** Uploads and the signed PDFs filed against a
project do not queue offline yet; the record itself does.
