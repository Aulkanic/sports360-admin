import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { urls } from "@/routes";

const AddMemberPage: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		const formData = new FormData(e.currentTarget);
		const payload = Object.fromEntries(formData.entries());
		console.log("Submitting new member:", payload);
		setTimeout(() => {
			setLoading(false);
			navigate(urls.members);
		}, 600);
	}

	return (
		<div className="max-w-2xl">
			<h1 className="text-xl font-semibold mb-4">Add New Member</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label className="space-y-1">
						<span className="text-sm">Full Name</span>
						<Input name="name" placeholder="John Doe" required />
					</label>
					<label className="space-y-1">
						<span className="text-sm">Email</span>
						<Input type="email" name="email" placeholder="john@example.com" required />
					</label>
					<label className="space-y-1">
						<span className="text-sm">Phone</span>
						<Input name="phone" placeholder="+1 555-1234" />
					</label>
					<label className="space-y-1">
						<span className="text-sm">Status</span>
						<Input name="status" placeholder="Active / Inactive / Pending" />
					</label>
				</div>
				<div className="flex gap-2">
					<Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Member"}</Button>
					<Button type="button" variant="outline" onClick={() => navigate(urls.members)}>Cancel</Button>
				</div>
			</form>
		</div>
	);
};

export default AddMemberPage;