import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type NotificationPrefs = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

type OrganizationSettings = {
  orgName: string;
  supportEmail: string;
  domain: string;
};

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    sms: false,
    push: true,
  });
  const [org, setOrg] = useState<OrganizationSettings>({
    orgName: "Sports360 Club",
    supportEmail: "support@sports360.example",
    domain: "sports360.example",
  });
  const [saving, setSaving] = useState(false);

  function toggle<K extends keyof NotificationPrefs>(key: K) {
    setNotifications((p) => ({ ...p, [key]: !p[key] }));
  }

  function handleOrgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setOrg((p) => ({ ...p, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    // pretend POST
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    alert("Settings saved (demo)");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Control notifications, organization details, and advanced options.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Org-wide</Badge>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left rail: Sections */}
        <div className="lg:col-span-1 space-y-2">
          {[
            "General",
            "Notifications",
            "Security",
            "Billing",
            "Advanced",
          ].map((s) => (
            <div key={s} className="rounded-md bg-card border p-3">
              <p className="text-sm font-medium">{s}</p>
            </div>
          ))}
        </div>

        {/* Right: Panels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Organization</h2>
              <Button size="sm" variant="outline" onClick={handleSave}>
                Save
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Organization name</label>
                <Input
                  name="orgName"
                  value={org.orgName}
                  onChange={handleOrgChange}
                  placeholder="Your organization"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Support email</label>
                <Input
                  name="supportEmail"
                  type="email"
                  value={org.supportEmail}
                  onChange={handleOrgChange}
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Primary domain</label>
                <Input
                  name="domain"
                  value={org.domain}
                  onChange={handleOrgChange}
                  placeholder="example.com"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Notifications</h2>
              <Button size="sm" variant="outline" onClick={handleSave}>
                Save
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(
                [
                  { key: "email", label: "Email" },
                  { key: "sms", label: "SMS" },
                  { key: "push", label: "Push" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 rounded-md border bg-background p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={() => toggle(key)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Security</h2>
              <Button size="sm" variant="outline" onClick={handleSave}>
                Save
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md bg-background border p-3">
                <p className="text-xs text-muted-foreground">Two-factor authentication</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm">Authenticator app</p>
                  <Button size="sm">Enable</Button>
                </div>
              </div>
              <div className="rounded-md bg-background border p-3">
                <p className="text-xs text-muted-foreground">Sessions</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm">Active devices</p>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

