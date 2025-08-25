import React, { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  language: string;
  timezone: string;
  theme: "system" | "light" | "dark";
};

const initialForm: ProfileFormState = {
  fullName: "Super Admin",
  email: "admin@sports360.example",
  phone: "+1 (555) 123-4567",
  role: "Administrator",
  language: "en",
  timezone: "America/New_York",
  theme: "system",
};

const ProfilePage: React.FC = () => {
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "https://github.com/shadcn.png"
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    alert("Profile saved (demo)");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information, security, and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">Active</Badge>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Avatar + Account summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg bg-card border p-4">
            <h2 className="text-sm font-semibold mb-3">Account</h2>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarPreview} />
              </Avatar>
              <div className="space-y-2">
                <p className="font-medium leading-tight">{form.fullName}</p>
                <p className="text-xs text-muted-foreground">{form.email}</p>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card border p-4">
            <h2 className="text-sm font-semibold mb-3">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Joined", value: "Jan 2024" },
                { label: "Role", value: form.role },
                { label: "Events", value: "18" },
                { label: "Bookings", value: "76" },
              ].map((s) => (
                <div key={s.label} className="rounded-md bg-background border p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Forms */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="rounded-lg bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Personal Information</h2>
              <Button type="submit" size="sm" variant="outline">
                Update
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Full name</label>
                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Phone</label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Role</label>
                <Input name="role" value={form.role} onChange={handleChange} />
              </div>
            </div>
          </form>

          <div className="rounded-lg bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Preferences</h2>
              <Button size="sm" variant="outline" onClick={handleSave}>
                Save
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Language</label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full h-9 px-3 rounded-md border bg-background"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Time zone</label>
                <select
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  className="w-full h-9 px-3 rounded-md border bg-background"
                >
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Theme</label>
                <select
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className="w-full h-9 px-3 rounded-md border bg-background"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="rounded-lg bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Security</h2>
              <Button type="submit" size="sm" variant="outline">
                Update password
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Current password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">New password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Confirm new password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

